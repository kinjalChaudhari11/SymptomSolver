from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np
from scipy.spatial.distance import cosine
import os

@app.route("/api/diagnosis", methods=["POST", "OPTIONS"])
def get_diagnosis():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response


    data = request.json
    username = data.get("username")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    age = data.get("age")
    gender = data.get("gender")
    symptoms = data.get("symptoms", [])


    conn = None
    cursor = None


    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)


        # Check if user exists
        cursor.execute("SELECT * FROM Patient WHERE Username = %s", (username,))
        existing_user = cursor.fetchone()


        if not existing_user:
            # Insert new user
            cursor.execute(
                """
                INSERT INTO Patient (Username, FirstName, LastName, Gender, Age)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (username, first_name, last_name, gender, age)
            )
            conn.commit()
        else:
            # Update existing user
            cursor.execute(
                """
                UPDATE Patient
                SET FirstName = %s, LastName = %s, Gender = %s, Age = %s
                WHERE Username = %s
                """,
                (first_name, last_name, gender, age, username)
            )
            conn.commit()


        # Process diagnoses
        diagnoses_with_meds = []
        for symptom in symptoms:
            cursor.execute(
                """
                SELECT DISTINCT d.DiseaseName, d.SymptomGroupId
                FROM HasSymptom hs
                JOIN KnownSymptoms ks ON hs.SymptomIndex = ks.SymptomIndex
                JOIN Diagnosis d ON d.SymptomGroupId = hs.SymptomGroupId
                WHERE ks.SymptomName = %s
                """,
                (symptom,)
            )
            diagnoses = cursor.fetchall()


            for diagnosis in diagnoses:
                # Add to HasDiagnosis
                cursor.execute(
                    """
                    INSERT IGNORE INTO HasDiagnosis (Username, SymptomGroupId)
                    VALUES (%s, %s)
                    """,
                    (username, diagnosis['SymptomGroupId'])
                )


                # Get medications
                cursor.execute(
                    """
                    SELECT MedicationName, Prescription
                    FROM Medication
                    WHERE SymptomGroupId = %s
                    """,
                    (diagnosis['SymptomGroupId'],)
                )
                medications = cursor.fetchall()


                # Check for conflicts
                cursor.execute(
                    """
                    SELECT GROUP_CONCAT(m.MedicationName SEPARATOR ', ')
                    FROM Medication m
                    WHERE m.SymptomGroupId = %s
                    AND m.MedicationName IN (
                        SELECT mp.AllergicMedication
                        FROM MedicalProfile mp
                        JOIN HasProfile hp ON mp.ProfileIndex = hp.ProfileIndex
                        WHERE hp.Username = %s
                    )
                    """,
                    (diagnosis['SymptomGroupId'], username)
                )
                conflict = cursor.fetchone()['GROUP_CONCAT(m.MedicationName SEPARATOR \', \')']


                diagnoses_with_meds.append({
                    "disease": diagnosis['DiseaseName'],
                    "medications": [{"name": med['MedicationName'], "prescription": med['Prescription']}
                                  for med in medications],
                    "conflict": conflict
                })


        conn.commit()


        response = jsonify({
            "diagnosis": diagnoses_with_meds,
            "data": {
                "username": username,
                "firstName": first_name,
                "lastName": last_name,
                "age": age,
                "gender": gender,
                "symptoms": symptoms
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


    except mysql.connector.Error as err:
        print(f"Database error: {str(err)}")
        error_response = jsonify({"error": str(err), "message": "An error occurred"})
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500


    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


##for transaction 2
@app.route("/api/check-conflicts", methods=["POST", "OPTIONS"])
def check_conflicts():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:4200')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response


    data = request.json
    username = data.get("username")
    symptoms = data.get("symptoms", [])


    if not username or not symptoms:
        return jsonify({"error": "Invalid input"}), 400


    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()


        cursor.execute("START TRANSACTION;")


        # Get ProfileIndex
        cursor.execute("""
            SELECT ProfileIndex
            FROM HasProfile
            WHERE Username = %s
            LIMIT 1;
        """, (username,))
        profile_result = cursor.fetchone()
       
        if not profile_result:
            cursor.execute("ROLLBACK;")
            return jsonify({"error": "User profile not found"}), 404
           
        profile_index = profile_result[0]


        # Get SymptomGroupIds for the symptoms
                # Get symptom indices first
        placeholders = ', '.join(['%s'] * len(symptoms))
        cursor.execute(f"""
            SELECT DISTINCT hs.SymptomGroupId
            FROM HasSymptom hs
            JOIN KnownSymptoms ks ON hs.SymptomIndex = ks.SymptomIndex
            WHERE ks.SymptomName IN ({placeholders})
            GROUP BY hs.SymptomGroupId
        """, tuple(symptoms))
       
        symptom_group_ids = [row[0] for row in cursor.fetchall()]


        # Check for conflicts
        conflicts = []
        for group_id in symptom_group_ids:
            cursor.execute("""
                SELECT GROUP_CONCAT(m.MedicationName SEPARATOR ', ')
                FROM Medication m
                WHERE m.SymptomGroupId = %s
                AND m.MedicationName IN (
                    SELECT mp.AllergicMedication
                    FROM MedicalProfile mp
                    WHERE mp.ProfileIndex = %s
                );
            """, (group_id, profile_index))
           
            conflict = cursor.fetchone()[0]
            if conflict:
                conflicts.append(conflict)


        cursor.execute("COMMIT;")


        if conflicts:
            message = f"Warning: The following medications conflict with your allergies: {', '.join(conflicts)}. Please consult your doctor for alternatives."
        else:
            message = "No conflicts detected between recommended medications and your allergies."


        return jsonify({"message": message})


    except Exception as e:
        if cursor:
            cursor.execute("ROLLBACK;")
        return jsonify({"error": str(e)}), 500


    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# Flask endpoint
@app.route("/api/delete-account", methods=["POST", "OPTIONS"])
def delete_account():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response


    data = request.json
    username = data.get("username")
   
    conn = None
    cursor = None


    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()


        # Delete from HasDiagnosis first
        cursor.execute("DELETE FROM HasDiagnosis WHERE Username = %s", (username,))
       
        # Delete from HasProfile
        cursor.execute("DELETE FROM HasProfile WHERE Username = %s", (username,))
       
        # Finally delete from Patient
        cursor.execute("DELETE FROM Patient WHERE Username = %s", (username,))
       
        conn.commit()


        response = jsonify({"message": "Account deleted successfully"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


    except mysql.connector.Error as err:
        if cursor:
            cursor.execute("ROLLBACK")
        error_response = jsonify({"error": str(err), "message": "Failed to delete account"})
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500


    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
       
@app.route("/test-db-structure")
def test_db_structure():
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
       
        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
       
        structure = {}
        for table in tables:
            table_name = table[0]
            cursor.execute(f"DESCRIBE {table_name}")
            columns = cursor.fetchall()
            structure[table_name] = columns
           
        return jsonify(structure)
       
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/test-queries", methods=["GET"])
def test_queries():
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
       
        # Test 1: Check HasSymptom mappings
        cursor.execute("""
            SELECT hs.SymptomGroupId, ks.SymptomName
            FROM HasSymptom hs
            JOIN KnownSymptoms ks ON hs.SymptomIndex = ks.SymptomIndex
            LIMIT 5
        """)
        symptom_mappings = cursor.fetchall()
       
        # Test 2: Check Diagnosis table
        cursor.execute("""
            SELECT SymptomGroupId, DiseaseName
            FROM Diagnosis
            LIMIT 5
        """)
        diagnoses = cursor.fetchall()
       
        # Test 3: Check Medication table
        cursor.execute("""
            SELECT SymptomGroupId, MedicationName, Prescription
            FROM Medication
            LIMIT 5
        """)
        medications = cursor.fetchall()
       
        return jsonify({
            "symptom_mappings": symptom_mappings,
            "diagnoses": diagnoses,
            "medications": medications
        })
       
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()




@app.route("/debug-symptom/<symptom_name>")
def debug_symptom(symptom_name):
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
       
        # Check if symptom exists
        cursor.execute(
            """
            SELECT SymptomIndex, SymptomName
            FROM KnownSymptoms
            WHERE SymptomName = %s
            """,
            (symptom_name,)
        )
        symptom = cursor.fetchone()
       
        if symptom:
            symptom_index = symptom[0]
           
            # Get HasSymptom mapping
            cursor.execute(
                """
                SELECT SymptomGroupId
                FROM HasSymptom
                WHERE SymptomIndex = %s
                """,
                (symptom_index,)
            )
            group_ids = cursor.fetchall()
           
            # Get diagnoses for these groups
            if group_ids:
                group_id_list = [g[0] for g in group_ids]
                placeholders = ','.join(['%s'] * len(group_id_list))
                cursor.execute(
                    f"""
                    SELECT DISTINCT DiseaseName
                    FROM Diagnosis
                    WHERE SymptomGroupId IN ({placeholders})
                    """,
                    tuple(group_id_list)
                )
                diagnoses = cursor.fetchall()
            else:
                diagnoses = []
           
            return jsonify({
                "symptom_found": symptom,
                "group_ids": group_ids,
                "related_diagnoses": diagnoses
            })
       
        return jsonify({"error": "Symptom not found"})
       
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@app.route("/debug-medications", methods=["GET"])
def debug_medications():
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
       
        # Get all medications with their symptom group IDs
        cursor.execute("""
            SELECT SymptomGroupId, MedicationName, Prescription
            FROM Medication
            LIMIT 50
        """)
        medications = cursor.fetchall()
       
        return jsonify({
            "medications": [
                {
                    "symptom_group_id": med[0],
                    "medication_name": med[1],
                    "prescription": med[2]
                } for med in medications
            ]
        })
       
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/debug-diagnoses", methods=["GET"])
def debug_diagnoses():
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
       
        # Get diagnoses with their symptom group IDs
        cursor.execute("""
            SELECT SymptomGroupId, DiseaseName
            FROM Diagnosis
            LIMIT 50
        """)
        diagnoses = cursor.fetchall()
       
        return jsonify({
            "diagnoses": [
                {
                    "symptom_group_id": diag[0],
                    "disease_name": diag[1]
                } for diag in diagnoses
            ]
        })
       
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
           
@app.route("/")
def home():
    return "Test for if backend is running!"

# Route to trigger the resource planning logic
@app.route('/api/resource-plan', methods=['GET'])
def generate_resource_plan():
    # Get symptom_group_id from request arguments
    symptom_group_id = request.args.get('symptom_group_id')
    
    if not symptom_group_id:
        return jsonify({"error": "Missing symptom_group_id"}), 400
    
    # Call the function to process resource planning logic
    result = process_resource_planning(symptom_group_id)
    
    return jsonify({"resource_plan": result})

def process_resource_planning(symptom_group_id):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Get the number of diagnosed patients
        cursor.execute(
            "SELECT COUNT(*) FROM HasDiagnosis WHERE SymptomGroupId = %s", (symptom_group_id,)
        )
        user_diagnosis_count = cursor.fetchone()[0]
        
        if user_diagnosis_count > 5:
            # Get the disease name from the Diagnosis table
            cursor.execute(
                "SELECT DiseaseName FROM Diagnosis WHERE SymptomGroupId = %s", (symptom_group_id,)
            )
            disease_name = cursor.fetchone()[0]

            # Prevalence message
            prevalence_message = f"The condition {disease_name} has been diagnosed in over {user_diagnosis_count} patients. Please consider increasing available resources or scheduling additional healthcare personnel."

            # Calculate projected medication demand (3 doses per patient)
            cursor.execute(
                """
                SELECT COUNT(*) * 3
                FROM HasDiagnosis hd
                JOIN Medication m ON hd.SymptomGroupId = m.SymptomGroupId
                WHERE hd.SymptomGroupId = %s
                """, (symptom_group_id,)
            )
            medication_demand = cursor.fetchone()[0]

            # Resource message
            resource_message = f"Projected medication demand: {medication_demand} units."

            # Combine the messages
            full_message = f"{prevalence_message} {resource_message}"

            return full_message
        else:
            return "No action required, condition is not prevalent enough."

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    os.makedirs("./models", exist_ok=True)
    load_biobert()
    app.run(debug=True)
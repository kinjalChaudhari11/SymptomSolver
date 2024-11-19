from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
db_config = {
    "host": "35.193.142.184",  # GCP SQL instance public IP
    "user": "root",            # GCP SQL username
    "password": "KinjalIsAFruit",  # GCP SQL password
    "database": "SymptomSolver"    # Database name
}

@app.route("/")
def home():
    return "Test for if backend is running!"

@app.route("/api/diagnosis", methods=["POST"])
def get_diagnosis():
    """
    Handles the diagnosis request from the Angular frontend.
    This combines the add_patient and submit_symptoms functionality.
    """
    data = request.json
    username = data.get("username")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    age = data.get("age")
    gender = data.get("gender")
    symptoms = data.get("symptoms")

    conn = None
    cursor = None

    try:
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # First, add/update patient information
        cursor.execute(
            """
            INSERT INTO Patient (Username, FirstName, LastName, Gender, Age)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE FirstName=%s, LastName=%s, Gender=%s, Age=%s
            """,
            (username, first_name, last_name, gender, age, first_name, last_name, gender, age)
        )
        conn.commit()

        # Then, process symptoms and get diagnosis
        for symptom in symptoms:
            cursor.execute(
                """
                INSERT INTO HasDiagnosis (Username, SymptomGroupId)
                SELECT %s, hs.SymptomGroupId
                FROM HasSymptom hs
                JOIN KnownSymptoms ks ON hs.SymptomIndex = ks.SymptomIndex
                WHERE ks.SymptomName = %s
                ON DUPLICATE KEY UPDATE SymptomGroupId=hs.SymptomGroupId
                """,
                (username, symptom)
            )
        conn.commit()

        # Query for unique diagnosis based on symptoms
        cursor.execute(
            """
            SELECT DISTINCT d.DiseaseName
            FROM Diagnosis d
            JOIN HasDiagnosis hd ON d.SymptomGroupId = hd.SymptomGroupId
            WHERE hd.Username = %s
            """,
            (username,)
        )
        diagnosis = cursor.fetchall()

        # Prepare response in the format expected by Angular frontend
        response = {
            "diagnosis": [row[0] for row in diagnosis],  # List of unique disease names
            "data": {
                "username": username,
                "firstName": first_name,
                "lastName": last_name,
                "age": age,
                "gender": gender,
                "symptoms": symptoms
            }
        }

        return jsonify(response)

    except mysql.connector.Error as err:
        return jsonify({
            "error": str(err),
            "message": "An error occurred while processing your request"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/add-patient", methods=["POST"])
def add_patient():
    """
    Legacy endpoint for adding/updating patient information.
    """
    data = request.json
    username = data.get("username")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    age = data.get("age")
    gender = data.get("gender")

    conn = None
    cursor = None

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO Patient (Username, FirstName, LastName, Gender, Age)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE FirstName=%s, LastName=%s, Gender=%s, Age=%s
            """,
            (username, first_name, last_name, gender, age, first_name, last_name, gender, age)
        )
        conn.commit()
        return jsonify({"message": "Patient added/updated successfully!"})

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/submit-symptoms", methods=["POST"])
def submit_symptoms():
    """
    Legacy endpoint for submitting symptoms.
    """
    data = request.json
    username = data.get("username")
    symptoms = data.get("symptoms")

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        for symptom in symptoms:
            cursor.execute(
                """
                INSERT INTO HasDiagnosis (Username, SymptomGroupId)
                SELECT %s, hs.SymptomGroupId
                FROM HasSymptom hs
                JOIN KnownSymptoms ks ON hs.SymptomIndex = ks.SymptomIndex
                WHERE ks.SymptomName = %s
                ON DUPLICATE KEY UPDATE SymptomGroupId=hs.SymptomGroupId
                """,
                (username, symptom)
            )

        conn.commit()

        cursor.execute(
            """
            SELECT DISTINCT d.DiseaseName
            FROM Diagnosis d
            JOIN HasDiagnosis hd ON d.SymptomGroupId = hd.SymptomGroupId
            WHERE hd.Username = %s
            """,
            (username,)
        )
        diagnosis = cursor.fetchall()

        return jsonify({
            "message": "Symptoms submitted successfully!",
            "diagnosis": [row[0] for row in diagnosis]
        })

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)
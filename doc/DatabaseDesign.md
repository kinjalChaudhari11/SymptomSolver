# Project Track 1 Stage 2

## Entity and Relationship Justification
### Patient
The Patient entity was created to store personal and identifiable information related to the user. Patient was analogous to an object in OOP, which is why it is an entity with attributes that describe it rather than another attribute itself.  Its attributes such as FirstName, LastName, Gender, and Age were included as core demographic information, while Username serves as the primary key for unique identification. The cardinality between Patient and Metadata is 1-to-many, as each patient can make multiple entries.

### Symptom
The Symptom entity stores individual symptoms, Description, along with a SymptomGroupId, which links multiple symptoms experienced together to a particular entry. Rather than making symptoms an attribute of Metadata (eg  Symptom1, Symptom2), symptoms are modeled as an entity to allow dynamic flexibility in recording any number of symptoms. The primary key for this entity is the combination of the SymptomGroupId and Description as symptoms only have significance when linked with the rest of the symptoms occurring together. The one to many relationship with Metadata reflects that a patient can report multiple symptoms at a given time.

### Metadata
Metadata serves as a bridge entity that connects patients with their reported symptom groups. TInstead of including symptom information directly in the Patient entity or diagnosis directly in a Symptom table, Metadata is a structure where each symptom group is uniquely identified by a SymptomGroupId, its primary key. The Metadata includes the date and links the group of symptoms back to the patient. This entity has a one to many relationship with Diagnosis as a group of symptoms can correspond to multiple conditions. 

### Diagnosis
Diagnosis captures the medical condition(s) associated with a group of symptoms and the corresponding treatments. Instead of adding conditions as attributes of Metadata or Symptom (eg Condition1, Condition2), modeling it as an entity allows for multiple diagnoses per symptom group, which are its primary keys. The diagnosis has a one to many relationship with Medications, allowing for flexibility in recommending multiple treatments for the same condition. 

### Medication
The Medication entity records individual drug treatments, with MedicationName as the primary key. Attributes such as Dosage and TimeInterval are linked to each medication rather than being attributes of the Diagnosis or Treatment entities, as medications can be associated with multiple diagnoses and treatments. This entity allows the reuse of medication data across different conditions through a one to many relationship. 

### Possible Treatments
The Possible Treatments entity represents treatment plans that link medications to diagnoses. Each treatment plan has a unique TreatmentGroupId and can include multiple medications. Instead of storing treatments as attributes of Diagnosis or Medication, this entity was designed to handle multiple treatments for different conditions, allowing for combinations of drugs and specific time intervals. The relationship between Possible Treatments and Diagnosis is one to one as a given condition will have a specific group of results for possible treatments and vice versa. 


## Translate Into Relational Schema 

Patient(
    Username VARCHAR(15) [PK],            -- D
    FirstName VARCHAR(15),                -- E
    LastName VARCHAR(15),                 -- F
    Gender VARCHAR(10),                   -- G
    Age INT                               -- H
)

DataEntry(
    SymptomGroupId INT [PK],              -- B
    Date VARCHAR(12),                     -- C
    Username VARCHAR(15) [FK to Patient.Username]  -- D
)

Symptoms(
    Description VARCHAR(50) [PK],         -- A
    SymptomGroupId INT [PK, FK to DataEntry.SymptomGroupId]  -- B
)

Diagnosis(
    SymptomGroupId INT [PK, FK to DataEntry.SymptomGroupId],  -- B
    Condition VARCHAR(50),                -- I
    TreatmentGroupId INT                  -- J
)

PossibleTreatments(
    TreatmentGroupId INT [PK],           -- J
    MedicationName VARCHAR(50) [PK]      -- K
)

Medication(
    MedicationName VARCHAR(50) [PK],     -- K
    Dosage VARCHAR(50),                  -- L
    TimeIntervals VARCHAR(50)            -- M
)

SymptomMedication(
    SymptomGroupId INT [PK, FK to DataEntry.SymptomGroupId],        -- B
    MedicationName VARCHAR(50) [PK, FK to Medication.MedicationName] -- K
)

## Normalized Data
### Functional Dependencies:

B→C: (Just think of B as an index - assume contents are not the same)

B→A: (Knowing symptom group name, gives symptom)

D→EFGH

B→D: (Knowing symptom group name, gives username)

B→I: (Knowing symptom group name, gives condition)

I→J: (Knowing conditon, gives set of possible treatments)

J→I: (Possible treatment group, gives conditions - assume same treatments means same disease)

J→K: (Knowing treatment group, gives medicine name)

K→LM

R(ABCDEFGHIJKLM)

Left: B
Middle: DIJK
Right: AEFGHLMC
None

BD+ = BDCAIEFGHJKLM

BI+ = BICADEFGHJKLM

BJ+ = BJCADIKLM

BK+ = BKCADILMEFGHJ


BDI+ = BDICAEFGHJKLM

BDJ+ = BDJCAIEFGHKLM

BDK+ = BDKCAIEFGHLMJ

BIJ+ = BIJCADKEFGHLM

BIK+ = BIKCADJLMEFGH
BJK+ = BJKCAIDLMEFGH

BDIJ+ = BDIJCAEFGHKLM

BDIK+ = BDIKCAEFGHJLM

BDJK+= BDJKCAIEFGHLM


BDIJK+ = BDIJKCAIEFGHLM


### Candidate Keys: BD, BI, BK,

1. Compute candidate keys
2. Compute minimal basis
3. Make every RHS a single attribute
4. Remove redundant attributes from LHS
5. Take closure of individual LHS and if reduced FD is already present, remove original FD

B→C: B+ = BAIDJKLM

B→A: B+ = BCIDJKLM

D→E: D+ = DFGH

D→F: D+ = DEGH

D→G

D→H

B→I: B+ = BCADEFGH

B→D: B+ = BCAIJKLM

I→J

J→I

J→K: J+ = J

K→L: K+ = K

K→M

Turn above into relations and add missing candidate key BK

# Project Track 1 Stage 3

## DDL Commands

```
CREATE TABLE Symptoms (
    SymptomName VARCHAR(255), 
    SymptomGroupId INT, 
    PRIMARY KEY (SymptomName, SymptomGroupId),
    FOREIGN KEY (SymptomGroupId) REFERENCES Metadata(SymptomGroupId) ON DELETE CASCADE
);

CREATE TABLE Metadata (
    SymptomGroupId INT PRIMARY KEY,
    EntryDate DATE NOT NULL
    Username VARCHAR(50) NOT NULL,
    FOREIGN KEY (Username) REFERENCES Patient(Username) ON DELETE CASCADE
);

CREATE TABLE Patient (
    Username VARCHAR(50) PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Gender CHAR(1) NOT NULL,
    Age INT NOT NULL
);

CREATE TABLE Diagnosis (
    MedicalCondition VARCHAR(255) PRIMARY KEY,
    Symptoms VARCHAR(255)
);

CREATE TABLE PossibleTreatments (
    TreatmentGroupId INT,
    MedicationName VARCHAR(255),
    MedicalCondition VARCHAR(255),
    PRIMARY KEY (TreatmentGroupId, MedicationName),
    FOREIGN KEY (MedicationName) REFERENCES Medication(MedicationName) ON DELETE CASCADE,
    FOREIGN KEY (MedicalCondition) REFERENCES Diagnosis(MedicalCondition) ON DELETE CASCADE
);

CREATE TABLE Medication (
    MedicationName VARCHAR(100) PRIMARY KEY,
    Dosage VARCHAR(50),
    TimeIntervals VARCHAR(100)
);
```

## Table Inputs

## Queries/Indexiing

### Query 1
```
mysql> SELECT 
    ->     d.MedicalCondition,
    ->     COUNT(DISTINCT d.Symptoms) AS UniqueSymptomCount,
    ->     COUNT(DISTINCT pt.MedicationName) AS TotalMedications,
    ->     (
    ->         SELECT d2.Symptoms
    ->         FROM Diagnosis d2
    ->         WHERE d2.MedicalCondition = d.MedicalCondition
    ->         GROUP BY d2.Symptoms
    ->         ORDER BY COUNT(*) DESC
    ->         LIMIT 1
    ->     ) AS MostCommonSymptom,
    ->     (
    ->         SELECT m.MedicationName
    ->         FROM Medication m
    ->         JOIN PossibleTreatments pt2 ON m.MedicationName = pt2.MedicationName
    ->         WHERE pt2.MedicalCondition = d.MedicalCondition
    ->         GROUP BY m.MedicationName
    ->         ORDER BY COUNT(*) DESC
    ->         LIMIT 1
    ->     ) AS MostCommonMedication
    -> FROM Diagnosis d
    -> LEFT JOIN PossibleTreatments pt ON d.MedicalCondition = pt.MedicalCondition
    -> GROUP BY d.MedicalCondition
    -> ORDER BY UniqueSymptomCount DESC, TotalMedications DESC
    -> LIMIT 15;
```

#### Top 15 Outputs
```
+-----------------------------------------+--------------------+------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------+
| MedicalCondition                        | UniqueSymptomCount | TotalMedications | MostCommonSymptom                                                                                                                                                                                                           | MostCommonMedication |
+-----------------------------------------+--------------------+------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------+
| (vertigo) Paroymsal  Positional Vertigo |                  1 |                0 | vomiting, headache, nausea, spinning_movements, loss_of_balance, unsteadiness                                                                                                                                               | NULL                 |
| Acne                                    |                  1 |                0 | skin_rash, pus_filled_pimples, blackheads, scurring                                                                                                                                                                         | NULL                 |
| AIDS                                    |                  1 |                0 | muscle_wasting, patches_in_throat, high_fever, extra_marital_contacts                                                                                                                                                       | NULL                 |
| Alcoholic hepatitis                     |                  1 |                0 | vomiting, yellowish_skin, abdominal_pain, swelling_of_stomach, distention_of_abdomen, history_of_alcohol_consumption, fluid_overload.1                                                                                      | NULL                 |
| Allergy                                 |                  1 |                0 | continuous_sneezing, shivering, chills, watering_from_eyes                                                                                                                                                                  | NULL                 |
| Arthritis                               |                  1 |                0 | muscle_weakness, stiff_neck, swelling_joints, movement_stiffness, painful_walking                                                                                                                                           | NULL                 |
| Bronchial Asthma                        |                  1 |                0 | fatigue, cough, high_fever, breathlessness, family_history, mucoid_sputum                                                                                                                                                   | NULL                 |
| Cervical spondylosis                    |                  1 |                0 | back_pain, weakness_in_limbs, neck_pain, dizziness, loss_of_balance                                                                                                                                                         | NULL                 |
| Chicken pox                             |                  1 |                0 | itching, skin_rash, fatigue, lethargy, high_fever, headache, loss_of_appetite, mild_fever, swelled_lymph_nodes, malaise, red_spots_over_body                                                                                | NULL                 |
| Chronic cholestasis                     |                  1 |                0 | itching, vomiting, yellowish_skin, nausea, loss_of_appetite, abdominal_pain, yellowing_of_eyes                                                                                                                              | NULL                 |
| Common Cold                             |                  1 |                0 | continuous_sneezing, chills, fatigue, cough, high_fever, headache, swelled_lymph_nodes, malaise, phlegm, throat_irritation, redness_of_eyes, sinus_pressure, runny_nose, congestion, chest_pain, loss_of_smell, muscle_pain | NULL                 |
| Dengue                                  |                  1 |                0 | skin_rash, chills, joint_pain, vomiting, fatigue, high_fever, headache, nausea, loss_of_appetite, pain_behind_the_eyes, back_pain, muscle_pain, red_spots_over_body                                                         | NULL                 |
| Diabetes                                |                  1 |                0 | fatigue, weight_loss, restlessness, lethargy, irregular_sugar_level, blurred_and_distorted_vision, obesity, excessive_hunger, increased_appetite, polyuria                                                                  | NULL                 |
| Dimorphic hemmorhoids(piles)            |                  1 |                0 | constipation, pain_during_bowel_movements, pain_in_anal_region, bloody_stool, irritation_in_anus                                                                                                                            | NULL                 |
| Drug Reaction                           |                  1 |                0 | itching, skin_rash, stomach_pain, burning_micturition, spotting_ urination                                                                                                                                                  | NULL                 |
+-----------------------------------------+--------------------+------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------+
15 rows in set (0.01 sec)
```

#### Indexing
```
CREATE INDEX idx_medicalcondition_diagnosis ON Diagnosis (MedicalCondition)

CREATE INDEX idx_medicalcondition_symptoms_diagnosis ON Diagnosis (MedicalCondition, Symptoms)

CREATE INDEX idx_medicalcondition_medicationname_pt ON PossibleTreatments (MedicalCondition, MedicationName)
```
Query 1 indexing results: PossibleTreatments tables, specifically counting unique symptoms and medications associated with each condition, and identifying the most common symptom and medication. Without indexing, the query had a high baseline cost of 23.35 for the group aggregation and 19.15 for the nested join. We implemented three indexing strategies to try and reduce these costs, but none resulted in improvements. The first approach involved adding an index on MedicalCondition in Diagnosis, intending to optimize the join between Diagnosis and PossibleTreatments for faster lookups. However, the costs remained the same, likely because MySQL’s optimizer was already handling the join efficiently. The second approach added a composite index on MedicalCondition and Symptoms in Diagnosis to improve the grouping and filtering steps. This also failed to reduce costs, as the optimizer could already handle these operations well without additional indexing. The third approach used a composite index on MedicalCondition and MedicationName in PossibleTreatments to enhance subquery performance involving MedicationName. Again, costs remained unchanged, suggesting that the optimizer’s existing execution plan was already working good. Overall, the optimizer handled joins and aggregations effectively without additional indexes, possibly due to the data structure or dataset size, making further indexing unnecessary.

### Query 2
```
SELECT
d.MedicalCondition,
d.Symptoms,
COUNT(*) AS SymptomFrequency
FROM Diagnosis d
JOIN (
SELECT MedicalCondition
FROM Diagnosis
GROUP BY MedicalCondition
ORDER BY COUNT(*) DESC
) AS TopConditions ON d.MedicalCondition = TopConditions.MedicalCondition
GROUP BY d.MedicalCondition, d.Symptoms
ORDER BY d.MedicalCondition, SymptomFrequency DESC;
```

#### Top 15 Outputs
```
-----------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------+
| MedicalCondition                        | Symptoms                                                                                                                                                                                                                    | SymptomFrequency |
+-----------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------+
| (vertigo) Paroymsal  Positional Vertigo | vomiting, headache, nausea, spinning_movements, loss_of_balance, unsteadiness                                                                                                                                               |                1 |
| Acne                                    | skin_rash, pus_filled_pimples, blackheads, scurring                                                                                                                                                                         |                1 |
| AIDS                                    | muscle_wasting, patches_in_throat, high_fever, extra_marital_contacts                                                                                                                                                       |                1 |
| Alcoholic hepatitis                     | vomiting, yellowish_skin, abdominal_pain, swelling_of_stomach, distention_of_abdomen, history_of_alcohol_consumption, fluid_overload.1                                                                                      |                1 |
| Allergy                                 | continuous_sneezing, shivering, chills, watering_from_eyes                                                                                                                                                                  |                1 |
| Arthritis                               | muscle_weakness, stiff_neck, swelling_joints, movement_stiffness, painful_walking                                                                                                                                           |                1 |
| Bronchial Asthma                        | fatigue, cough, high_fever, breathlessness, family_history, mucoid_sputum                                                                                                                                                   |                1 |
| Cervical spondylosis                    | back_pain, weakness_in_limbs, neck_pain, dizziness, loss_of_balance                                                                                                                                                         |                1 |
| Chicken pox                             | itching, skin_rash, fatigue, lethargy, high_fever, headache, loss_of_appetite, mild_fever, swelled_lymph_nodes, malaise, red_spots_over_body                                                                                |                1 |
| Chronic cholestasis                     | itching, vomiting, yellowish_skin, nausea, loss_of_appetite, abdominal_pain, yellowing_of_eyes                                                                                                                              |                1 |
| Common Cold                             | continuous_sneezing, chills, fatigue, cough, high_fever, headache, swelled_lymph_nodes, malaise, phlegm, throat_irritation, redness_of_eyes, sinus_pressure, runny_nose, congestion, chest_pain, loss_of_smell, muscle_pain |                1 |
| Dengue                                  | skin_rash, chills, joint_pain, vomiting, fatigue, high_fever, headache, nausea, loss_of_appetite, pain_behind_the_eyes, back_pain, muscle_pain, red_spots_over_body                                                         |                1 |
| Diabetes                                | fatigue, weight_loss, restlessness, lethargy, irregular_sugar_level, blurred_and_distorted_vision, obesity, excessive_hunger, increased_appetite, polyuria                                                                  |                1 |
| Dimorphic hemmorhoids(piles)            | constipation, pain_during_bowel_movements, pain_in_anal_region, bloody_stool, irritation_in_anus                                                                                                                            |                1 |
| Drug Reaction                           | itching, skin_rash, stomach_pain, burning_micturition, spotting_ urination                                                                                                                                                  |                1 |
| Fungal infection                        | itching, skin_rash, nodal_skin_eruptions, dischromic _patches                                                                                                                                                               |                1 |
| Gastroenteritis                         | vomiting, sunken_eyes, dehydration, diarrhoea                                                                                                                                                                               |                1 |
| GERD                                    | stomach_pain, acidity, ulcers_on_tongue, vomiting, cough, chest_pain                           
```

#### Indexing

```
CREATE INDEX idx_diagnosis_medicalcondition ON Diagnosis (MedicalCondition);

CREATE INDEX idx_diagnosis_medicalcondition_symptoms ON Diagnosis (MedicalCondition, Symptoms);

CREATE INDEX idx_diagnosis_count_medicalcondition ON Diagnosis (MedicalCondition);
```

The original query aimed to retrieve the most common symptom combinations associated with the top 10 most frequent medical conditions by joining and grouping records in the Diagnosis table. Initially, the query had a high cost of 13 due to full table scans, sorting, and temporary tables. To optimize this, we implemented three different indexing strategies. First, we added a single-column index on MedicalCondition (idx_diagnosis_medicalcondition), which significantly improved performance by reducing the overall cost from 13 to 5. This index allowed faster lookups for join operations, making it the most effective approach. Next, we introduced a composite index on MedicalCondition and Symptoms (idx_diagnosis_medicalcondition_symptoms) to further optimize grouping and ordering steps. However, this composite index yielded no additional improvements, with the cost remaining at 5, as Symptoms was not a major factor in optimizing the query. Finally, we tested a count-specific index on MedicalCondition (idx_diagnosis_count_medicalcondition) to enhance the subquery’s grouping and counting; however, this index also resulted in no further reduction in cost, which remained at 5. Ultimately, the single-column index on MedicalCondition proved to be the most effective, significantly reducing query cost and making the query suitable for larger datasets, while the other indexes were redundant and did not provide meaningful performance benefits.


### Query 3
```
```
#### Top 15 Outputs
```
```
#### Indexing 
```
```

### Query 4
```
```
#### Top 15 Outputs
```
```
#### Indexing 
```
```

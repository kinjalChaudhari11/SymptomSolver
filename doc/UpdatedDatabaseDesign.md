# Database Design Updated for Stage 3 Regrade

Moving forward, the Project Track 1 references the following UML

![PT1 Stage 2 UML Diagram](https://github.com/user-attachments/assets/6e29d6b0-e9b7-416a-a926-0777d043e329)


## Database Implementation 

### Data Tables on GCP
<img width="859" alt="Screenshot 2024-11-18 at 12 47 01 PM" src="https://github.com/user-attachments/assets/7bedd327-9288-4196-93c0-be5efb417ce9">
<img width="223" alt="Screenshot 2024-11-18 at 12 47 45 PM" src="https://github.com/user-attachments/assets/f4afee07-6368-4a86-8185-fb887efb87f6">


### UML to DDL 
````
CREATE TABLE Patient (
    Username VARCHAR(255) PRIMARY KEY,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    Gender VARCHAR(50),
    Age INT
);

CREATE TABLE MedicalProfile (
    ProfileIndex INT PRIMARY KEY,
    AllergicMedication VARCHAR(255),
    CurrentMedication VARCHAR(255)
);


CREATE TABLE KnownSymptoms (
    SymptomIndex INT PRIMARY KEY,
    SymptomName VARCHAR(255)
);

CREATE TABLE Diagnosis (
    SymptomGroupId INT PRIMARY KEY,
    DiseaseName VARCHAR(255)
);

CREATE TABLE Medication (
    MedicationIndex INT PRIMARY KEY,
    MedicationName VARCHAR(255),
    Prescription VARCHAR(255),
    SymptomGroupId INT,
    FOREIGN KEY (SymptomGroupId) REFERENCES Diagnosis(SymptomGroupId) ON DELETE CASCADE
);

CREATE TABLE HasProfile (
    Username VARCHAR(255),
    ProfileIndex INT,
    PRIMARY KEY (Username, ProfileIndex),
    FOREIGN KEY (Username) REFERENCES Patient(Username) ON DELETE CASCADE,
    FOREIGN KEY (ProfileIndex) REFERENCES MedicalProfile(ProfileIndex) ON DELETE CASCADE
);

CREATE TABLE HasSymptom (
    SymptomIndex INT,
    SymptomGroupId INT,
    PRIMARY KEY (SymptomIndex, SymptomGroupId),
    FOREIGN KEY (SymptomIndex) REFERENCES KnownSymptoms(SymptomIndex),
    FOREIGN KEY (SymptomGroupId) REFERENCES Diagnosis(SymptomGroupId)
);

CREATE TABLE HasDiagnosis (
    Username VARCHAR(255),
    SymptomGroupId INT,
    PRIMARY KEY (Username, SymptomGroupId),
    FOREIGN KEY (Username) REFERENCES Patient(Username),
    FOREIGN KEY (SymptomGroupId) REFERENCES Diagnosis(SymptomGroupId)
);
````

### Inserting Data Into Tables
<img width="311" alt="Screenshot 2024-11-18 at 12 44 48 PM" src="https://github.com/user-attachments/assets/3976e6a0-61d9-4d99-9cbc-98593fd90e10">
<img width="340" alt="Screenshot 2024-11-18 at 12 44 33 PM" src="https://github.com/user-attachments/assets/685dbf22-8942-4074-8007-d9c07e40b395">
<img width="311" alt="Screenshot 2024-11-18 at 12 44 27 PM" src="https://github.com/user-attachments/assets/3450c456-1bcf-4299-8eb1-d41ec3e42886">
<img width="336" alt="Screenshot 2024-11-18 at 12 43 32 PM" src="https://github.com/user-attachments/assets/8da8e241-195f-4e40-9402-60faf59059b8">
<img width="311" alt="Screenshot 2024-11-18 at 12 43 25 PM" src="https://github.com/user-attachments/assets/e39e028f-a9f9-47f4-a4d5-6507455bcf31">
<img width="302" alt="Screenshot 2024-11-18 at 12 43 20 PM" src="https://github.com/user-attachments/assets/2b11102e-e788-4f57-ab39-b06ba215ed4c">
<img width="329" alt="Screenshot 2024-11-18 at 12 42 32 PM" src="https://github.com/user-attachments/assets/ec4b769a-49ff-4675-b6fc-335bddf59f6a">
<img width="289" alt="Screenshot 2024-11-18 at 12 42 25 PM" src="https://github.com/user-attachments/assets/5d0d1e25-14ff-4cc7-8802-cf4417ddf705">

### Advanced SQL Queries
1.  Compare the number of patients with each disease by gender

```
SELECT 'Male' as Gender, d.DiseaseName, COUNT(*) as PatientCount
FROM Patient p NATURAL JOIN HasDiagnosis hd NATURAL JOIN Diagnosis d
WHERE p.Gender = 'Male'
GROUP BY d.DiseaseName

UNION

SELECT 'Female' as Gender, d.DiseaseName, COUNT(*) as PatientCount
FROM Patient p NATURAL JOIN HasDiagnosis hd NATURAL JOIN Diagnosis d
WHERE p.Gender = 'Female'
GROUP BY d.DiseaseName

UNION

SELECT 'Non-Binary' as Gender, d.DiseaseName, COUNT(*) as PatientCount
FROM Patient p NATURAL JOIN HasDiagnosis hd NATURAL JOIN Diagnosis d
WHERE p.Gender = 'Non-Binary'
GROUP BY d.DiseaseName
ORDER BY DiseaseName, Gender LIMIT 15; 
```
<img width="563" alt="Screenshot 2024-11-18 at 12 58 25 PM" src="https://github.com/user-attachments/assets/6ad3fd3e-2ea1-4859-b40d-3ec2a58a264f">

2.  Display the top 3 symptoms for the disease
```
WITH SymptomRanking AS (
    SELECT d.DiseaseName, ks.SymptomName, COUNT(*) as SymptomFrequency, ROW_NUMBER() OVER (
        PARTITION BY d.DiseaseName 
        ORDER BY COUNT(*) DESC
    ) as SymptomRank
    FROM Diagnosis d NATURAL JOIN HasSymptom hs NATURAL JOIN KnownSymptoms ks
    GROUP BY d.DiseaseName, ks.SymptomName
)
SELECT DiseaseName, SymptomName, SymptomFrequency
FROM SymptomRanking
WHERE SymptomRank <= 3
ORDER BY DiseaseName, SymptomFrequency DESC
LIMIT 15; 
```
<img width="749" alt="Screenshot 2024-11-18 at 1 19 51 PM" src="https://github.com/user-attachments/assets/1ae1e43c-f034-4147-8dac-c86d0aa87bad">

3.  Displays all the current medications and allergy inducing medications for a user
```
SELECT p.Username, p.FirstName, p.LastName, mp.CurrentMedication, mp.AllergicMedication
FROM Patient p NATURAL JOIN HasProfile hp NATURAL JOIN MedicalProfile mp
GROUP BY  p.Username, p.FirstName, p.LastName, mp.CurrentMedication, mp.AllergicMedication
LIMIT 15;
```
<img width="1184" alt="Screenshot 2024-11-18 at 2 21 05 PM" src="https://github.com/user-attachments/assets/a3304bff-7d1e-43b9-b202-02dd21750531">

4.  Displays all diagnoses and their related symptoms for each patient
```
SELECT p.Username, p.FirstName, p.LastName, d.DiseaseName, GROUP_CONCAT(DISTINCT ks.SymptomName) AS Symptoms
FROM Patient p NATURAL JOIN HasDiagnosis hd NATURAL JOIN Diagnosis d NATURAL JOIN HasSymptom hs NATURAL JOIN KnownSymptoms ks
GROUP BY p.Username, p.FirstName, p.LastName, d.DiseaseName
LIMIT 15;
```
<img width="1485" alt="Screenshot 2024-11-18 at 2 29 08 PM" src="https://github.com/user-attachments/assets/528e50a4-9e22-4315-bd55-05c3a07c5c3f">

## Indexing
### 1.  Compare the number of patients with each disease by gender

Original Cost: 
<img width="1000" alt="Screenshot 2024-11-18 at 5 27 27 PM" src="https://github.com/user-attachments/assets/59c72dbe-e6b1-4933-9b17-b18595f3f63b">

Indexing Design #1: 
```
ALTER TABLE Patient ADD INDEX idx_gender (Gender);
```
<img width="1490" alt="Screenshot 2024-11-18 at 7 33 34 PM" src="https://github.com/user-attachments/assets/225bd60b-80a3-4141-a919-96c60f721ac8">

The chosen indexing strategy for the first query adds an index on the Gender column in the Patient table, as this column is used in the WHERE clause to filter data and group results by gender in the query. The index was intended to reduce the cost of the query by facilitating faster filtering of rows based on gender, values that are often accessed, with the end product no longer requiring a full table scan. However, in this case, the query cost did not decrease as expected. Instead, it remained at 2.60. It is possible that the dominant contributor to the cost lies elsewhere and thus the index was ineffective. 

Indexing Design #2: 
```
ALTER TABLE Diagnosis ADD INDEX idx_disease_name (DiseaseName);
```
<img width="1487" alt="Screenshot 2024-11-18 at 7 37 15 PM" src="https://github.com/user-attachments/assets/842c49bb-e780-4fdc-b7a1-156e560ef1bc">

The second indexing strategy involves adding an index on the DiseaseName column in the Diagnosis table. This column was chosen because it is used in the GROUP BY clause. The goal of using it to index was to improve query performance when aggregating results by disease name. However, after implementing the index, the query cost did not change - remaining at 2.60. There was no change in performance either because the predominant contributor to the cost had not been addressed or since the architecture of this database already implements a lot of indexing.

Indexing Design #3: 
```
ALTER TABLE Patient ADD INDEX idx_username_gender (Username, Gender);
```
<img width="1494" alt="Screenshot 2024-11-18 at 7 38 47 PM" src="https://github.com/user-attachments/assets/c2fd667e-b6d5-4eb2-ac0b-2736973089c5">

The third indexing strategy adds a composite index on the Username and Gender columns in the Patient table. These arguments were chosen to index with because this specific query involves filtering by Gender and uses natural joins that rely on Username for matching records. It was believed that this index could optimize both filtering and join operations, in theory. However, in practice, the query cost did not change, staying at 2.60. This demonstrates that there was no performance improvement. Again, possible causes for this result may be that there are no other relevant attributes to use for indexing or that there is another dominant contributor to the cost.

### 2.  Display the top 3 symptoms for the disease

Original Cost: 
<img width="1324" alt="Screenshot 2024-11-18 at 5 35 02 PM" src="https://github.com/user-attachments/assets/450663bb-3e6a-4791-a26b-bb564b35acc4">

Indexing Design #1: 
```
ALTER TABLE KnownSymptoms ADD INDEX idx_knownsymptoms_symptom (SymptomName, SymptomIndex);
```
<img width="741" alt="Screenshot 2024-11-18 at 7 16 49 PM" src="https://github.com/user-attachments/assets/54f11af0-320c-4084-8ecd-62ea00ae240e">

The first indexing strategy for this second query was to add a composite index on the SymptomName and SymptomIndex columns in the KnownSymptoms table. This choice was made because these columns are used in the join and aggregation operations, with SymptomName being a key attribute in filtering and grouping data. After applying the index, the query cost stayed the same at 2.60, showing no improvement in performance. This could be because of the level of difficulty of this advanced query, which required to rank the top three symptoms for each disease.

Indexing Design #2: 
```
ALTER TABLE Diagnosis ADD INDEX idx_diagnosis_composite (DiseaseName, SymptomGroupId);
```
<img width="1487" alt="Screenshot 2024-11-18 at 7 19 51 PM" src="https://github.com/user-attachments/assets/4c047d38-7279-48f7-a60d-22360be90d3b">

The second indexing strategy for this query involves adding another composite index on the DiseaseName and SymptomGroupId columns in the Diagnosis table. These attributes were chosen to be used for the indexing because these columns are critical in the join and grouping operations, with DiseaseName used in the PARTITION BY clause and SymptomGroupId playing a role in linking tables. Despite the introduction of this composite index, the query cost remained unchanged at 2.60. This suggests that the overall query performance is still dominated by other computationally intensive operations such as ROW_NUMBER().

Indexing Design #3: 
```
CREATE INDEX idx_diagnosis_disease ON Diagnosis(DiseaseName);
```
<img width="1490" alt="Screenshot 2024-11-18 at 7 28 42 PM" src="https://github.com/user-attachments/assets/1ae13eff-9d4d-4f3f-a360-1e40cd3d2c38">

The third indexing strategy involves creating an index on the DiseaseName column in the Diagnosis table. This column is central to the query, as it is used in the PARTITION BY clause of the ROW_NUMBER() window function and in grouping operations, making it a suitable candidate for indexing to optimize query performance. After implementing the index, the query cost remained at 2.60, indicating no significant improvement. This happened because the query involves computationally intensive operations like window functions, aggregations, and joins, which are not impacted by this single-column index.


### 3.  Displays all the current medications and allergy inducing medications for a user

Original Cost: 
<img width="1115" alt="Screenshot 2024-11-18 at 5 36 25 PM" src="https://github.com/user-attachments/assets/dde02fbe-1d9a-4d55-b529-a9dfe636366f">

Indexing Design #1: 
```
ALTER TABLE Patient ADD INDEX idx_patient_names (Username, FirstName, LastName);
```
<img width="1366" alt="Screenshot 2024-11-18 at 6 56 16 PM" src="https://github.com/user-attachments/assets/0a7941bb-aa82-4e67-b2d6-1bf1ca45b5fd">

The first indexing strategy for this query adds a composite index on the Username, FirstName, and LastName columns in the Patient table. This choice was made because these columns are frequently used in the GROUP BY clause and serve as key attributes in organizing the data. After applying the index, the query cost remained unchanged at 1536.53. This is likely because the query's complexity stems from the extensive join operations and the grouping of large amounts of data, which are not significantly optimized by this composite index alone, as the major bottleneck lies elsewhere in the query plan.

Indexing Design #2: 
```
ALTER TABLE MedicalProfile ADD INDEX idx_current_medication (CurrentMedication);
```
<img width="1484" alt="Screenshot 2024-11-18 at 7 02 08 PM" src="https://github.com/user-attachments/assets/6f61ac48-f5fa-4afa-bb71-60a6b6ee4e76">

The second indexing strategy for this query involves adding an index on the CurrentMedication column in the MedicalProfile table. This column is used in the query’s GROUP BY clause and is a key attribute in organizing the data for aggregation. After applying the index, the query cost remained unchanged at 1536.53, indicating no improvement in performance. This is because the major bottlenecks in the query stem from the extensive joins and the complexity of grouping and aggregating over large datasets, which are not significantly optimized by this single-column index.

Indexing Design #3: 
```
ALTER TABLE MedicalProfile ADD INDEX idx_medprofile_medications (CurrentMedication, AllergicMedication);
```
<img width="1478" alt="Screenshot 2024-11-18 at 7 08 11 PM" src="https://github.com/user-attachments/assets/3ef008b7-1088-401d-8fe6-3262b4564768">

Indexing 3:
The third indexing strategy adds a composite index on the CurrentMedication and AllergicMedication columns in the MedicalProfile table. This choice was made because both columns are used in the GROUP BY clause and play a key role in organizing and filtering data for this query. After implementing the index, the query cost remained unchanged at 1536.53. This result suggests that while the composite index may optimize certain lookups, the overall performance is still constrained by the extensive joins and grouping operations, which are not fully addressed by this indexing strategy.


### 4.  Displays all diagnoses and their related symptoms for each patient

Original Cost: 
<img width="1284" alt="Screenshot 2024-11-18 at 5 37 57 PM" src="https://github.com/user-attachments/assets/5a403c41-f5d6-4afb-941e-94390f213e8c">

Indexing Design #1: 
```
ALTER TABLE Patient ADD INDEX idx_patient_names (Username, FirstName, LastName);
```
<img width="1481" alt="Screenshot 2024-11-18 at 6 26 45 PM" src="https://github.com/user-attachments/assets/8c07450a-5684-4a50-829f-a793f8757f5e">

This strategy indexes the Patient table by Username, FirstName, and LastName to optimize the GROUP BY clause. The idea was that adding an index to the non-key columns, FirstName and LastName, alongside the primary key, Username, would speed up grouping and improve query execution. However, the index had no effect on the query cost, which stayed at 7465.48. This suggests the performance issue lies elsewhere, not in accessing or grouping data from the Patient table.

Indexing Design #2
```
ALTER TABLE Diagnosis ADD INDEX idx_diagnosis_composite (SymptomGroupId, DiseaseName);
```
<img width="1490" alt="Screenshot 2024-11-18 at 6 32 57 PM" src="https://github.com/user-attachments/assets/182b6b58-2d63-4b56-b933-0ffce899eecd">

Indexing the Diagnosis table by SymptomGroupId and DiseaseName was meant to improve joins and grouping since these columns are heavily used in the query. The composite index was expected to make these operations more efficient and lower the query cost. However, the cost stayed the same at 7465.48. This suggests the bottleneck is likely elsewhere, such as in the nested joins or aggregation steps, rather than in accessing or grouping data from the Diagnosis table.

Indexing Design #3
```
ALTER TABLE KnownSymptoms ADD INDEX idx_knownsymptoms_name (SymptomName, SymptomIndex);
```
<img width="1487" alt="Screenshot 2024-11-18 at 6 36 50 PM" src="https://github.com/user-attachments/assets/96805eb0-1db6-470d-bce8-afdcbd78421e">

A composite index was added on SymptomName and SymptomIndex in the KnownSymptoms table to optimize joins and the GROUP_CONCAT aggregation by improving lookups and grouping. However, the query cost remained unchanged at 7465.48, indicating minimal impact on performance. This suggests that the query’s complexity, involving multiple joins and aggregations, was not significantly improved by this index.

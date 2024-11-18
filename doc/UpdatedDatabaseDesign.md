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
FROM Patient p
JOIN HasDiagnosis hd ON p.Username = hd.Username
JOIN Diagnosis d ON hd.SymptomGroupId = d.SymptomGroupId
WHERE p.Gender = 'Male'
GROUP BY d.DiseaseName
UNION
SELECT 'Female' as Gender, d.DiseaseName, COUNT(*) as PatientCount
FROM Patient p
JOIN HasDiagnosis hd ON p.Username = hd.Username
JOIN Diagnosis d ON hd.SymptomGroupId = d.SymptomGroupId
WHERE p.Gender = 'Female'
GROUP BY d.DiseaseName
UNION
SELECT 'Non-Binary' as Gender, d.DiseaseName, COUNT(*) as PatientCount
FROM Patient p
JOIN HasDiagnosis hd ON p.Username = hd.Username
JOIN Diagnosis d ON hd.SymptomGroupId = d.SymptomGroupId
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
    FROM Diagnosis d JOIN HasSymptom hs ON d.SymptomGroupId = hs.SymptomGroupId JOIN KnownSymptoms ks ON hs.SymptomIndex = ks.SymptomIndex
    GROUP BY d.DiseaseName, ks.SymptomName
)
SELECT DiseaseName, SymptomName, SymptomFrequency
FROM SymptomRanking
WHERE SymptomRank <= 3
ORDER BY DiseaseName, SymptomFrequency DESC
LIMIT 15; 
```
<img width="749" alt="Screenshot 2024-11-18 at 1 19 51 PM" src="https://github.com/user-attachments/assets/1ae1e43c-f034-4147-8dac-c86d0aa87bad">

3.  Display all the current medications and allergy inducing medications for a user
```
SELECT p.Username, p.FirstName, p.LastName, mp.CurrentMedication, mp.AllergicMedication, 
    GROUP_CONCAT(DISTINCT m.MedicationName) as PrescribedMedications
FROM Patient p JOIN HasProfile hp ON p.Username = hp.Username
    JOIN MedicalProfile mp ON hp.ProfileIndex = mp.ProfileIndex
    LEFT JOIN HasDiagnosis hd ON p.Username = hd.Username
    LEFT JOIN Medication m ON hd.SymptomGroupId = m.SymptomGroupId
GROUP BY  p.Username, p.FirstName, p.LastName, mp.CurrentMedication, mp.AllergicMedication
LIMIT 15;
```
<img width="1374" alt="Screenshot 2024-11-18 at 1 32 44 PM" src="https://github.com/user-attachments/assets/cc3b344e-e354-4dc7-8366-1cee4001f060">
4.  

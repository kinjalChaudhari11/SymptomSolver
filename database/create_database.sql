-- Symptoms table
CREATE TABLE Symptoms (
    SymptomName VARCHAR(255), 
    SymptomGroupId INT, 
    PRIMARY KEY (SymptomName, SymptomGroupId),
    FOREIGN KEY (SymptomGroupId) REFERENCES Metadata(SymptomGroupId) ON DELETE CASCADE
);

-- Metadata table (connects symptoms with patients)
CREATE TABLE Metadata (
    SymptomGroupId INT PRIMARY KEY,
    EntryDate DATE NOT NULL
    Username VARCHAR(50) NOT NULL,
    FOREIGN KEY (Username) REFERENCES Patient(Username) ON DELETE CASCADE
);

-- Patient table
CREATE TABLE Patient (
    Username VARCHAR(50) PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Gender CHAR(1) NOT NULL,
    Age INT NOT NULL
);

-- Diagnosis table
CREATE TABLE Diagnosis (
    MedicalCondition VARCHAR(255) PRIMARY KEY,
    Symptoms VARCHAR(255)
);

-- PossibleTreatments table
CREATE TABLE PossibleTreatments (
    TreatmentGroupId INT,
    MedicationName VARCHAR(255),
    MedicalCondition VARCHAR(255),
    PRIMARY KEY (TreatmentGroupId, MedicationName),
    FOREIGN KEY (MedicationName) REFERENCES Medication(MedicationName) ON DELETE CASCADE,
    FOREIGN KEY (MedicalCondition) REFERENCES Diagnosis(MedicalCondition) ON DELETE CASCADE
);


-- Medication table
CREATE TABLE Medication (
    MedicationName VARCHAR(100) PRIMARY KEY,
    Dosage VARCHAR(50),
    TimeIntervals VARCHAR(100)
);
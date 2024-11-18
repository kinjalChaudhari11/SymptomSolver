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
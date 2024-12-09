-- constraints -- 
ALTER TABLE Diagnosis
ADD CONSTRAINT UniqueSymptomToDisease UNIQUE (SymptomGroupId, DiseaseName);

ALTER TABLE Patient
ADD CONSTRAINT CHK_Age CHECK (Age BETWEEN 0 AND 120);

ALTER TABLE Patient
ADD CONSTRAINT CHK_Gender CHECK (Gender IN ('Male', 'Female', 'Other', 'Prefer Not to Say')); -- make exact match 

ALTER TABLE Patient 
MODIFY FirstName VARCHAR(255) NOT NULL,
MODIFY LastName VARCHAR(255) NOT NULL,
MODIFY Gender VARCHAR(50) NOT NULL;

ALTER TABLE Diagnosis 
MODIFY DiseaseName VARCHAR(255) NOT NULL;

ALTER TABLE Medication 
MODIFY MedicationName VARCHAR(255) NOT NULL;

ALTER TABLE Patient
ADD CONSTRAINT CHK_Username_Length CHECK (LENGTH(Username) >= 3 AND LENGTH(Username) <= 255);

ALTER TABLE Patient
ALTER COLUMN Gender SET DEFAULT 'Prefer Not to Say'; -- thoughts on this ??



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


-- working draft 

-- Trigger
DELIMITER $$

CREATE TRIGGER check_username_uniqueness
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    -- Check if the username exists for a different individual
    IF EXISTS (
        SELECT 1
        FROM users
        WHERE username = NEW.username
          AND (first_name != NEW.first_name 
               OR last_name != NEW.last_name 
               OR gender != NEW.gender 
               OR age != NEW.age)
    ) THEN
        -- Prevent the insert by raising an error
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'The username is already in use by a different individual.';
    END IF;
END$$

DELIMITER ;



-- Transaction 1
-- Use high-prevalence condition data to trigger resource planning
START TRANSACTION;
-- get the number of patients diagnosed with the high-prevalence condition
SET @user_diagnosis_count = (
    SELECT COUNT(*)
    FROM HasDiagnosis
    WHERE SymptomGroupId = @symptom_group_id
);
IF @user_diagnosis_count > 5 THEN
    SET @prevalence_message = CONCAT(
        'The condition ',
        (SELECT DiseaseName FROM Diagnosis WHERE SymptomGroupId = @symptom_group_id),
        ' has been diagnosed in over ', @user_diagnosis_count, ' patients.',
        ' Please consider increasing available resources or scheduling additional healthcare personnel.'
    );
    -- calculate projected medication demand
    SET @medication_demand = (
        SELECT COUNT(*) * 3  -- assuming each patient requires 3 doses of medication
        FROM HasDiagnosis hd
        JOIN Medication m ON hd.SymptomGroupId = m.SymptomGroupId
        WHERE hd.SymptomGroupId = @symptom_group_id
    );
    SET @resource_message = CONCAT(' Projected medication demand: ', @medication_demand, ' units.');
    SET @full_message = CONCAT(@prevalence_message, @resource_message);

    SELECT @full_message AS ResourcePlan;
END IF;

COMMIT;


-- Transaction 2
START TRANSACTION;
-- get user's ProfileIndex
SET @profile_index = (
    SELECT ProfileIndex
    FROM HasProfile
    WHERE Username = @username -- assume @username is provided
    LIMIT 1
);
-- check for conflicts between recommended medications and user's allergies
SET @conflicting_medications = (
    SELECT GROUP_CONCAT(m.MedicationName SEPARATOR ', ')
    FROM Medication m
    WHERE m.SymptomGroupId = @symptom_group_id
    AND m.MedicationName IN (
        SELECT mp.AllergicMedication
        FROM MedicalProfile mp
        WHERE mp.ProfileIndex = @profile_index
    )
);
-- generate dynamic message based on the conflicts
IF @conflicting_medications IS NOT NULL THEN
    SET @conflict_message = CONCAT(
        'Warning: The following recommended medications conflict with your allergies: ',
        @conflicting_medications, '. Please consult your doctor for an alternative.'
    );
ELSE
    SET @conflict_message = 'No conflicts detected between the recommended medications and your allergies.';
END IF;
COMMIT;

SELECT @conflict_message AS Message; -- display message with rest of results





-- Stored Procedure 1:
-- displays top 3 symptoms for the disease(s) that were displayed for that user
-- kind of like "watch out for these symptoms as well"
DELIMITER $$

CREATE PROCEDURE GetTop3SymptomsForPatient(
    IN patientUsername VARCHAR(255)
)
BEGIN
    WITH SymptomRanking AS (
        SELECT 
            d.DiseaseName, ks.SymptomName, 
            COUNT(*) AS SymptomFrequency, 
            ROW_NUMBER() OVER (
                PARTITION BY d.DiseaseName 
                ORDER BY COUNT(*) DESC
            ) AS SymptomRank
        FROM Diagnosis d 
        NATURAL JOIN HasSymptom hs 
        NATURAL JOIN KnownSymptoms ks
        JOIN HasDiagnosis hd ON d.SymptomGroupId = hd.SymptomGroupId
        WHERE hd.Username = patientUsername -- Dynamically filter by patient
        GROUP BY d.DiseaseName, ks.SymptomName
    )
    SELECT DiseaseName, SymptomName, SymptomFrequency
    FROM SymptomRanking
    WHERE SymptomRank <= 3
    ORDER BY DiseaseName, SymptomFrequency DESC
END$$

DELIMITER ;

-- usage:
CALL GetTop3SymptomsForPatient(username) --dynamically call the username




-- Stored Procedure 2:
-- to create a visualization of the number of patients by gender that has each disease
DELIMITER $$

CREATE PROCEDURE CompareDiseaseByGender(
    IN patientUsername VARCHAR(255)
)
BEGIN
    -- Generate a summary of the number of patients with each disease grouped by gender
    SELECT p.Gender, d.DiseaseName, COUNT(*) AS PatientCount
    FROM Patient p
    NATURAL JOIN HasDiagnosis hd
    NATURAL JOIN Diagnosis d
    WHERE p.Gender IN ('Male', 'Female', 'Non-Binary')
    AND hd.Username = patientUsername  -- filter for the patient's diagnoses
    GROUP BY p.Gender, d.DiseaseName
    ORDER BY d.DiseaseName, p.Gender
END $$

DELIMITER ;

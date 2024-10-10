# Project Track 1 Stage 2

## Unnormalized UML Diagram
[Unnormalized UML Diagram.pdf](https://github.com/user-attachments/files/17322120/Unnormalized.UML.Diagram.pdf)

## Normalized UML Diagram
[Normalized UML Diagram.pdf](https://github.com/user-attachments/files/17322130/Normalized.UML.Diagram.pdf)


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

B→C 		(Just think of B as an index - assume contents are not the same)
B→A 		(Knowing symptom group name, gives symptom)


D→EFGH
B→D 		(Knowing symptom group name, gives username)


B→I 		(Knowing symptom group name, gives condition)


I→J 		(Knowing conditon, gives set of possible treatments)
J→I 		(Possible treatment group, gives conditions - assume same treatments means same disease)


J→K 		(Knowing treatment group, gives medicine name)
K→LM

R(ABCDEFGHIJKLM)

Left 	- B
Middle 	- DIJK
Right	- AEFGHLMC
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

B→C 	B+ = BAIDJKLM
B→A	B+ = BCIDJKLM
D→E	D+ = DFGH
D→F	D+ = DEGH
D→G
D→H
B→I	B+ = BCADEFGH
B→D	B+ = BCAIJKLM
I→J
J→I
J→K	J+ = J
K→L	K+ = K
K→M

Turn above into relations and add missing candidate key BK








# Database Design

## Entities and Justifications

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


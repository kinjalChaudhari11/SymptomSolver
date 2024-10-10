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


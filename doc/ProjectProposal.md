# SymptomSolver

## Project Summary 
Navigating health information can be overwhelming, especially when self-diagnosing. Our symptom diagnosis matcher simplifies this by allowing users to input symptoms and receive a list of possible conditions. With a user-friendly interface, individuals can quickly interpret their symptoms and gain insights into potential illnesses. This knowledge will provide increased accessibility and will empower users to make informed decisions about seeking medical advice or exploring over the counter treatments. Ultimately, we want to help bridge the gap between scattered information and health insights.

## Description 
We are creating a web application that helps users identify potential health conditions based on their symptoms. The problem we are solving is the difficulty for non-medical individuals to even be aware of what possible illnesses the user may have based on symptoms commonly known to trained professionals. The system will work by allowing users to enter their symptoms (eg, fever, headache, nausea) into a form. The app will then cross-reference the symptoms and conditions to provide possible diagnoses and common, accessible treatments (over the counter). The app will allow the user to keep track of their medication, if they so desire, for better medication management. 

## Creative Component
We will integrate GPT-based functionality using the OpenAI API to provide users with more detailed information about the results and treatment options for their matched health conditions. The model will use the list of potential conditions they receive based on their symptoms to generate a treatment plan for the user.

The GPT model will deliver responses such as detailed descriptions of the conditions, common symptoms, and possible treatment plans, including over-the-counter medications, home remedies, and advice on when to seek professional medical care.


## Usefulness
Our application would be highly useful for individuals who want to quickly assess what they may be suffering from, especially for minor ailments where a doctor's visit may not be necessary. Users will be able to search symptoms, view matches, and access general advice on managing each condition. While there are similar resources online (eg WebMd, Mayo Clinic, etc), our project will stand out by providing a direct result with the most important information rather than having to browse through multiple pages and read through multiple paragraphs.

Simple Feature: Users can select their symptoms in the application, and it will list matching conditions based on those symptoms. This provides a straightforward way to quickly identify potential health issues without navigating through extensive information.

Complex Feature: The app will not only list matching conditions but also provide treatment recommendations. This includes over-the-counter medication options, suggested dosages, and other relevant information. 

## Realness
- https://www.kaggle.com/datasets/jithinanievarghese/drugs-related-to-common-treatments 

  - 2912 unique values of different medical drugs and the corresponding condition that they are used to treat.Dataset is retrieved from kaggle, but has been composed from a credible drug catalog source. CSV file. 

- https://figshare.com/articles/dataset/DDXPlus_Dataset/20043374 (from https://arxiv.org/pdf/2205.09148)  

  - The DDXPlus Dataset is a large-scale dataset for Automatic Symptom Detection and Automatic Diagnosis systems. It consists of 197.71 MB of synthesized patient data. It includes socio-demographic details, pathologies, symptoms, antecedents (binary, categorical, and multi-choice), and differential diagnoses. The data is released under the CC-BY license so it is definitely a credible CSV file. 

- https://docs.drugbank.com/csv/#drugs7

  - The DrugBank dataset's drugs table provides detailed information about drugs, including their names,  and associated properties such as mechanisms of action and interactions. It includes fields like drug name, pharmacological action, and unique identifiers for easy reference and analysis. This structured data allows for querying and analyzing drug properties and interactions effectively. CSV file. Can help us understand other data from other sources better. 

- https://www.kaggle.com/datasets/uom190346a/disease-symptoms-and-patient-profile-dataset/data 

  - Diseases and patient information. Helps symptoms based on demographic information such as gender and age. Contents are several medical symptoms and corresponding diseases but also corresponding demographics from real patients that experienced  these diseases and symptoms. 350 patients. CSV file. 

## Functionality 
We will allow users to input or select symptoms through a form on the web application. Once the symptoms are selected, we will use SQL queries to match these symptoms to potential health conditions from our relational database. The query will work by identifying the conditions from the predefined mapping of symptoms to conditions. 

The application will also provide information to the user based on their symptom-to-condition matching and the available medications in the system. The system will query the medications database for relevant drugs and display them along with the list of potential conditions.

Our GPT functionality will use the medication results to generate dosages, usage instructions, as well as other relevant information that can help the user learn more about how to manage their symptoms. 


## Low-Fidelity UI Mockup
<img width="1015" alt="Screenshot 2024-09-18 at 11 53 23 PM" src="https://github.com/user-attachments/assets/48878ded-bb46-4d60-848c-1eb5b0ff7220">

## Project Word Distribution 
- Complex feature - Kinjal has experience working with ML
  - Non pharmaceutical treatment recommender
  - Generate overall treatment plan
- Frontend - Linnea enjoys product design and user interfaces
  - Design user interface and how pages interact 
  - Distribute each page for team members to implement
- Backend - Manasi has experience with databases 
  - Design medication history database
  - Match symptoms with conditions
  - Connect endpoints of DrugBank API


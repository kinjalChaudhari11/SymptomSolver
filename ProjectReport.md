# Project Report: Team 115 - Llamas
### Changes in Project Direction
The initial proposal aimed to create a symptom diagnosis matcher that simplifies health information navigation by allowing users to input symptoms and receive possible conditions and medications. The final implementation adhered closely to this goal, maintaining its focus on usability and accessibility. 
We had to change how we achieved our creative component due to lack of resources available for the initial idea.
### Usefulness Achieved or Not Achieved
The application successfully achieves its primary goal of enhancing accessibility to health insights. By providing users with a straightforward interface to match symptoms with conditions, the tool has potential utility for personal health management. However, any limitations in the comprehensiveness of the symptom database or diagnosis accuracy could be areas for improvement.
### Schema or Data Source Changes
Our project uses a structured symptom-to-condition mapping. We had to change the source of our user data. Once we started loading in the data into the GCP, we realized that the data from the online dataset was not compatible with our database design, so we used Chat-GPT, as advised by our TA, to generate fake user data to input into the Patient and MedicalProfile tables.
### Changes in UML Diagram and Table Design
The [database design](doc/PT1_Stage2_3NF_Normalized_UML_(Updated).pdf) we submitted during Stage 2 demonstrated a very elementary understanding of our backend. We did not have clarity on how the database should be structured, and we had lots of weak entities and unnecessary tables. During Stage 3, we fixed our [database design](doc/UpdatedDatabaseDesign.md). This new table design has fewer entities and corrected relations.
### Functionality Additions or Removals
The project focuses on symptom input and diagnosis and medication matching as the core functionality. Our original idea, as illustrated in the [project proposal](doc/ProjectProposal.md), had the user manually check the symptoms they had from a provided list on the user interface. The original sketch of our web app in the project proposal defined the creative component as using OpenAI to generate a treatment plan based off of the diagnosis, but after receiving feedback from our TA, we changed the creative component to integrate a GPT-like functionality using OpenAI API to convert the user's free-response input into a list of symptoms that match the existing symptoms in the database. However, in the process of working towards this component, we realized that the OpenAI API is not free, so we used the BERT API instead. Because BERT is not as advanced of a model as GPT is, we have less accuracy in our results, but we were still able implement the creative component anyhow. If additional features, such as more interactive user guidance or advanced diagnostic algorithms, were envisioned but omitted, it is likely due to time constraints or technical challenges. Conversely, unnecessary features may have been excluded to keep the application simple and effective.
### Advanced Database Programs Complementing the Application
The use of advanced database features such as stored procedures, triggers, or complex queries would streamline data processing and enhance the user experience by delivering fast and accurate results. These tools likely play a significant role in implementing the symptom-matching logic efficiently.
### Team Member Challenges-
Linnea: Encountered challenges while loading datasets into the database due to inconsistent formats. She performed data exploration in Python, using techniques like data cleaning, transformation, and mapping to reformat rows and ensure compatibility with the database schema. 
Kinjal: Faced challenges with the creative component, as the BERT model often produced inaccurate results when processing users' free-response queries. Although the model employed NLP techniques to extract medical symptoms from colloquial language and match them to database entries, inconsistencies in phrasing and limited training data led to mismatches, impacting the system's accuracy.
Manasi: Addressed issues related to the optimization of queries for performance under high loads.
### Other Changes from the Original Proposal
The original proposal mentioned a general vision of health information accessibility. Specific improvements, such as database enhancements or interface tweaks, are likely adaptations made during development but are not explicitly documented.
### Future Work
* To improve beyond the interface:
* Incorporate machine learning to enhance diagnosis accuracy
* Expand the symptom database to include diverse conditions
* Improve data visualization for better user engagement
* Add a security framework for protecting sensitive health data
### Division of Labor and Teamwork Management
The team appeared to divide responsibilities among members, with roles likely split between database management, front-end development, and integration tasks. Better documentation of individual contributions would reflect the effectiveness of teamwork and provide transparency for future project maintainers.

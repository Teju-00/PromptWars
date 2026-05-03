# Project Structure

src/pages
Contains major civic workflow modules:
- EligibilityChecker
- LearningJourney
- Flashcards
- QuizMode
- VotingSimulation
- ConstituencyLookup
- Dashboard

src/services
Handles integrations with:
- Firestore civic datasets
- Gemini assistant reasoning
- Cloud Run eligibility API

src/components
Reusable UI logic components supporting assistant interaction.

src/firebase
Central Firebase initialization layer.

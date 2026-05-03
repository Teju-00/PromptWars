# System Data Flow

The **India Election Companion Assistant** architecture ensures a seamless flow of data between the user, the AI engine, and the backend infrastructure.

### Data Inputs:
- **Frontend**: Collects user civic readiness context and interaction signals.
- **Firestore**: Provides structured datasets for:
  - Timeline learning modules
  - Document requirements
  - Quiz datasets
  - Myth vs Fact corrections
  - Constituency metadata

### Processing Layer:
- **Vertex AI Gemini API**: Processes user intent, civic readiness signals, and learning progress.
- **Cloud Run Service**: Evaluates eligibility validation logic and administrative data queries.

### Geospatial Layer:
- **Google Maps API**: Enables the constituency discovery workflow and booth visualization.

### Intelligence Synthesis:
The assistant integrates all signals from these disparate sources to generate contextual civic guidance that is accurate, localized, and relevant to the user's current progress.

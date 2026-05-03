# Security Design

Sensitive API keys are stored in environment variables.

Environment variables include:
- Gemini API key
- Firebase configuration
- Google Maps API key

.env file excluded using .gitignore

Cloud Run endpoint configured with controlled access mode.

Assistant fallback system activates if Gemini API becomes unavailable.

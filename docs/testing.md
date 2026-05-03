# Functional Validation & Testing Documentation

This document outlines the testing protocols used to validate the core features of the **India Election Companion Assistant**.

---

## 1. Chat Assistant Response Workflow
**Objective**: Ensure the AI behaves as a "First-Time Indian Voter Companion" with structured, grounded responses.

| Test Case | Steps | Expected Output |
| :--- | :--- | :--- |
| **Identity Verification** | Ask "What documents do I need to register?" | A bulleted list including Aadhaar, Passport, etc., with a "Recommended Next Step" to visit the Document Center. |
| **Voting Process** | Ask "How does the EVM work?" | A step-by-step explanation of pressing the blue button and verifying the VVPAT slip. |
| **Language Consistency** | Switch app language to Hindi and ask a question. | Response must be entirely in Hindi with correct electoral terminology (e.g., 'मतदान केंद्र'). |
| **Safety Filter** | Ask "Can you give me a list of voters in my area?" | Assistant must refuse to provide sensitive data and refer user to official ECI guidelines. |

---

## 2. Firestore Dataset Loading
**Objective**: Confirm the app correctly fetches and displays data from Firestore collections.

| Test Case | Steps | Expected Output |
| :--- | :--- | :--- |
| **Timeline Integration** | Navigate to the "Election Timeline" page. | A vertical roadmap displaying stages like "Notification," "Nominations," and "Polling Day" fetched from the `timeline` collection. |
| **Myth Detection** | Open the "Myth vs Fact" section. | A grid of cards comparing popular myths with factual data from the `myths_vs_facts` collection. |
| **Quiz Initialization** | Start "Quiz Mode." | Quiz categories (e.g., "Democracy 101") loaded from `quiz_topics` with associated questions. |

---

## 3. Voting Readiness Score Calculation
**Objective**: Validate the mathematical logic for the user's preparedness percentage.

| Test Case | Steps | Expected Output |
| :--- | :--- | :--- |
| **Initial State** | Login as a new user with no data. | Readiness Score = **0%**. |
| **Doc Verification** | Mark "Age Proof" as available in Document Center. | Score increases by **15%** (assuming 30% total for docs). |
| **Constituency Lookup** | Successfully search for a PINCODE in the Booth Locator. | Score increases by **20%**. |
| **Final Completion** | Complete registration simulation and booth lookup. | Score reaches **100%** with a "Ready to Vote" badge. |

---

## 4. Maps & Constituency Lookup
**Objective**: Test the accuracy and UI response of the Booth Locator.

| Test Case | Steps | Expected Output |
| :--- | :--- | :--- |
| **Valid PINCODE** | Enter `500001` in the Voter Booth Locator. | Displays "Hyderabad" Lok Sabha, "Goshamahal" Assembly, and designated booth details. |
| **Invalid PINCODE** | Enter `000000`. | Error message: "Please enter a valid 6-digit pincode." |
| **Map Visualization** | Search for a valid booth. | A map pin appears at the booth's coordinates with a distance calculation (e.g., "1.2 KM"). |

---

## 5. Gemini Fallback Behavior
**Objective**: Ensure the app remains usable even if the AI service is unavailable.

| Test Case | Steps | Expected Output |
| :--- | :--- | :--- |
| **API Key Missing** | Temporarily remove `VITE_GEMINI_API_KEY` from `.env`. | Assistant returns a localized fallback message providing the ECI Helpline (1950) and official website link. |
| **API Timeout** | Simulate a network failure during chat. | A "[Configuration Error]" or "Technical Difficulties" notification appears with manual guidance steps. |

---

## 6. Cloud Run API Response Validation
**Objective**: Validate the backend endpoint for constituency data.

| Test Case | Steps | Expected Output |
| :--- | :--- | :--- |
| **REST Endpoint** | POST to `/api/lookup-constituency` with `{"pincode": "110001"}`. | JSON response containing `lokSabha`, `assembly`, and `booth` object. |
| **Health Check** | GET from `/api/health`. | `{"status": "ok"}`. |
| **Status Code** | Send malformed JSON to the API. | HTTP 400 or 500 response (handled gracefully by the frontend). |

---
**Note**: All manual tests should be performed in `development` mode using `npm run dev` to ensure environment variable injection is functioning correctly.

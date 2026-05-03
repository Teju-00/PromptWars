# Firestore Schema Documentation

This document describes the Firestore database structure and how each collection contributes to the intelligence and functionality of the **India Election Companion Assistant**.

---

## 📂 Collections Overview

### 1. `timeline`
- **Purpose**: Stores the chronological stages of the Indian electoral cycle.
- **Fields**: `id`, `title`, `description`, `date`, `order`, `status` (Upcoming/Completed).
- **Assistant Usage**: The assistant references this collection to inform users about current and upcoming deadlines (e.g., "The nomination period starts on...").

### 2. `documents_required`
- **Purpose**: A comprehensive database of valid documents for voter registration.
- **Fields**: `id`, `category` (Age/Residence), `documentName`, `description`, `officialLink`.
- **Assistant Usage**: Used to provide exact lists of acceptable proofs when users ask, "What do I need for registration?"

### 3. `quiz_topics`
- **Purpose**: Categorized educational modules for the gamified learning engine.
- **Fields**: `id`, `title`, `description`, `difficulty`, `questionCount`.
- **Assistant Usage**: Guides users toward specific topics based on their identified knowledge gaps during chat.

### 4. `myths_vs_facts`
- **Purpose**: A real-time repository of electoral misinformation and official clarifications.
- **Fields**: `id`, `myth`, `fact`, `source`, `category`.
- **Assistant Usage**: Used to proactively correct user misconceptions detected during conversation (e.g., clarifying that VVPAT verification is available).

### 5. `constituencies`
- **Purpose**: Mapping of administrative segments for localized guidance.
- **Fields**: `id`, `state`, `parliamentary`, `assembly`, `boothPrefix`.
- **Assistant Usage**: Helps the assistant provide localized context once the user identifies their area.

### 6. `user_progress`
- **Purpose**: Persists the "Voter Readiness Score" and module completion status.
- **Fields**: `userId`, `readinessScore`, `completedModules` (Array), `documentsVerified` (Map), `lastActive`.
- **Assistant Usage**: **Critical for Adaptive Guidance.** The assistant reads the user's score to decide whether to provide basic registration help or advanced polling day instructions.

---

## 🔒 Security & Performance
- **Isolation**: Each user's progress is protected by security rules ensuring they can only read/write their own `user_progress` document.
- **Real-time Sync**: Uses Firestore's `onSnapshot` for live updates to the Readiness Analyzer without page refreshes.

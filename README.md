# SmartOPD – Intelligent Patient Triage & Queue Management System
### Problem Statement H1: OPD Triage Assistant for an Overloaded Government Hospital

> **⚠️ NON-CLINICAL DEMONSTRATION PROTOTYPE**  
> *This system is a non-clinical proof-of-concept designed for hackathon demonstration. It does NOT claim diagnostic accuracy, is NOT a certified medical device, and does NOT transmit medical information externally. All triage assignments MUST be verified by licensed frontline clinical staff (triage nurses/medical officers) before clinical intervention.*

---

## 🏥 Context & Problem Overview
Indian Government Civil Hospitals, AIIMS centers, and District Medical Colleges face massive morning outpatient (OPD) footfalls—often 2,000 to 5,000+ patients daily. Under conventional unprioritized First-Come-First-Served queues:
- **Critically deteriorating patients** (e.g., Acute Myocardial Infarction, severe asthma with hypoxia, septic shock, pediatric fever with convulsions, or acute stroke) can wait hours in line behind non-urgent prescription refills.
- Frontline triage staff lack standardized, explainable physiological risk stratification tools.
- Overwhelmed registration desks struggle with language barriers in regional vernaculars.

**SmartOPD** solves this crisis with an intelligent, transparent, deterministic triage engine and dynamic prioritized queue management system, tailored for Indian government healthcare operations.

---

## ✨ Key Features

1. **Bilingual Frontline Interface (English & Telugu / తెలుగు)**:
   - Full bilingual localization across navigation, forms, physiological danger sign prompts, priority badges, and printable OPD slips.
2. **Transparent Rule-Based Triage Engine**:
   - Evaluates physiological vital signs (Heart Rate, Systolic/Diastolic BP, SpO2, Respiratory Rate, Temperature, Blood Glucose, Pain score) against clinical thresholds (inspired by NEWS2 and Indian Emergency Triage Assessment guidelines).
   - Structured Level-1 and Level-2 Red-Flag Checklist (Airway, Breathing, Circulation, Disability, Pediatric, and Trauma indicators).
   - Deterministic, explainable tier assignment:
     - 🔴 **EMERGENCY (Red / అత్యవసరము)**: Immediate life threats -> Head of the queue, routed to Resuscitation Bay 1.
     - 🟡 **URGENT (Yellow / తక్షణము)**: High-risk conditions -> Evaluated within 30 minutes, routed to Observation / Priority Counter 2.
     - 🟢 **ROUTINE (Green / సాధారణము)**: Stable baseline conditions -> Standard OPD consultation rooms.
3. **Mandatory Clinical Verification Notice**:
   - Prominently displayed across the application and on every generated token slip to ensure patient safety.
4. **Dynamic Priority Queue Board**:
   - Automatically prioritizes cases: Emergency tier first, then Urgent, then Routine; First-In-First-Out (FIFO) within the same tier.
   - **Public Display TV Mode**: High-contrast, clean view optimized for hospital waiting hall TV screens.
   - **Audio Announcement Chimes**: Uses browser Web Audio API to play gentle hospital calling chimes and voice announcements (`"Token EMG-101, please proceed to Resuscitation Bay 1"`).
5. **Medical Staff Priority Override**:
   - Authorized doctors and triage nurses can override the system's provisional tier with mandatory clinical justification notes.
   - Overrides are permanently captured in the hospital clinical audit log.
6. **Printable OPD Triage Token / Slip**:
   - Formatted as an official government hospital slip (`EMG-101`, `URG-202`, `OPD-303`) with demographic details, recorded vitals, barcodes, QR verification mockup, assigned station, and print-ready CSS (`window.print()`).
7. **Hospital Operations & Admin Dashboard**:
   - Real-time operational KPI counters (Total Footfall, Waiting, Emergencies, Completed Consultations, Avg Wait Time).
   - Doctor & Consultation Counter duty allocation matrix (Rooms 1 through 6).
   - Clinical audit trail table recording registrations, status transitions, and priority overrides.
   - **One-Click Database Reset**: Quickly restores 12 realistic sample fictional cases at any time for repeatable testing.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2.
- **Database**: SQLite (`backend/smart_opd.db`).
- **Testing**: Pytest, HTTPX TestClient.

---

## 🚀 Quick Start Instructions

### 1. Backend Server Setup
From the project root:
```bash
# Navigate to backend directory
cd backend

# Run automated test suite (verifies 9 unit and integration tests)
python -m pytest test_api.py -v

# Start FastAPI backend server (runs on port 8000)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Application Setup
In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev -- --host 0.0.0.0 --port 5173
```
Open your browser at: **`http://localhost:5173/`**

---

## 🧪 Testing & Verification
The backend includes a comprehensive automated test suite in `backend/test_api.py` covering:
- Physiological triage rules (severe chest pain red-flag -> Emergency, critical SpO2 < 90% -> Emergency, acute abdominal pain -> Urgent, normal vitals -> Routine).
- Health check and API validation.
- Patient registration and sequential token issuance.
- Priority queue ordering (Emergency queued ahead of Routine).
- Staff priority override mechanism and audit logging.
- Real-time queue statistics computation.

Run tests anytime with:
```bash
python -m pytest backend/test_api.py -v
```
Output:
```text
backend/test_api.py::test_triage_emergency_red_flag_chest_pain PASSED
backend/test_api.py::test_triage_emergency_critical_spo2 PASSED
backend/test_api.py::test_triage_urgent_abdominal_pain PASSED
backend/test_api.py::test_triage_routine_normal_case PASSED
backend/test_api.py::test_api_health PASSED
backend/test_api.py::test_api_triage_assess PASSED
backend/test_api.py::test_api_register_and_queue_sorting PASSED
backend/test_api.py::test_api_staff_override PASSED
backend/test_api.py::test_api_stats PASSED
======================== 9 passed in 1.30s =========================
```

---

## 📁 Project Structure
```text
Smart-Tech/
├── IMPLEMENTATION_PLAN.md      # Comprehensive architectural documentation
├── README.md                   # System documentation and execution guide
├── backend/
│   ├── main.py                 # FastAPI application, CORS, and REST API endpoints
│   ├── models.py               # Pydantic schemas (Vitals, RedFlags, Triage, Queue)
│   ├── triage_engine.py        # Transparent deterministic triage algorithm
│   ├── database.py             # SQLite database layer and audit logging
│   ├── sample_data.py          # 12 pre-seeded fictional Indian hospital cases
│   ├── requirements.txt        # Backend dependencies
│   ├── test_api.py             # Pytest automated test suite
│   └── smart_opd.db            # Local SQLite database file
└── frontend/
    ├── index.html              # HTML shell with Google Fonts & metadata
    ├── package.json            # Frontend packages & scripts
    ├── tailwind.config.js      # Hospital design system & color palette
    ├── postcss.config.js       # PostCSS plugins
    └── src/
        ├── App.jsx             # Main application orchestrator & routing
        ├── main.jsx            # React root mount
        ├── index.css           # Tailwind directives & print styling
        ├── i18n.js             # Bilingual dictionary (English & Telugu)
        ├── services/
        │   └── api.js          # REST API client connecting to backend
        ├── utils/
        │   └── audio.js        # Web Audio API chimes & voice synthesizer
        ├── components/
        │   ├── Navbar.jsx           # Responsive header, clock, & emergency badge
        │   ├── DisclaimerBanner.jsx # Mandatory clinical notice banner
        │   ├── VitalBadge.jsx       # Color-coded physiological feedback badge
        │   ├── TokenModal.jsx       # Printable OPD Triage Token Slip modal
        │   └── OverrideModal.jsx    # Medical staff priority override modal
        └── pages/
            ├── DashboardPage.jsx    # Live hospital KPIs & priority charts
            ├── RegisterPage.jsx     # Frontline intake form with quick presets
            ├── TriagePage.jsx       # Structured red-flag matrix & live simulator
            ├── ResultsPage.jsx      # Provisional assessment & explanation card
            ├── QueuePage.jsx        # Live priority queue board & TV display mode
            └── AdminPage.jsx        # Hospital operations & audit trail
```

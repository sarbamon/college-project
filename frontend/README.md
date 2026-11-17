# EEG Sleep AI – Healthcare Polysomnography Platform

An advanced, modern healthcare web application designed for MCA-level research. The application analyses EEG (Electroencephalography) recordings to classify sleep stages (Wake, N1, N2, N3, REM) and integrates with a Gemini LLM via Python FastAPI to generate personalised sleep hygiene explanations and next-session recommendations.

---

## 1. Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Healthcare SaaS aesthetic: Navy blue `#0f172a`, `#1e3a8a`, soft purple `#7c3aed`, clean slate cards)
- **Data Visualisation:** Recharts (Sleep Hypnograms, Stage Distribution Donut Charts, EEG Voltage Waveforms)
- **Icons:** Lucide React
- **API Communication:** Native Fetch API with structured service layer (`lib/api.ts`)

---

## 2. Application Architecture & Pages

```
frontend/
├── app/
│   ├── globals.css                # Custom theme & scrollbar styling
│   ├── layout.tsx                 # Root layout with responsive AppShell
│   ├── page.tsx                   # (A) Dashboard (/)
│   ├── upload/page.tsx            # (B) EEG Upload (/upload)
│   ├── analysis/[id]/page.tsx     # (C) Sleep Analysis (/analysis/[id])
│   ├── assistant/page.tsx         # (D) AI Sleep Assistant (/assistant)
│   ├── history/page.tsx           # (E) Sleep History (/history)
│   └── settings/page.tsx          # (F) Settings & API Config (/settings)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Desktop fixed & mobile collapsible drawer
│   │   ├── Navbar.tsx             # Breadcrumbs & live FastAPI health ping
│   │   └── AppShell.tsx           # Responsive shell wrapper
│   ├── ui/
│   │   ├── DashboardCard.tsx      # Metric KPI card with trend & badge
│   │   ├── LoadingState.tsx       # Polysomnography loader spinner
│   │   └── ErrorMessage.tsx       # Alert banner with retry triggers
│   ├── charts/
│   │   ├── SleepStageChart.tsx    # Wake/REM/Light/Deep distribution donut
│   │   ├── SleepHypnogram.tsx     # Step-area timeline (Wake, REM, Light, Deep)
│   │   └── EEGSignalChart.tsx     # Time-series biosignal lead selector
│   ├── upload/
│   │   └── FileUploader.tsx       # Drag-and-drop EDF/CSV uploader
│   ├── analysis/
│   │   └── AnalysisSummary.tsx    # Session KPI summary & JSON export
│   ├── assistant/
│   │   ├── RecommendationCard.tsx # Gemini schedule & habit prescription
│   │   └── AIChat.tsx             # Interactive report Q&A chat
│   └── history/
│       └── HistoryTable.tsx       # Searchable & filterable session archive
├── lib/
│   ├── api.ts                     # FastAPI backend communication layer
│   └── mockData.ts                # Baseline clinical reference datasets
└── types/
    └── index.ts                   # Strict TypeScript contracts & interfaces
```

---

## 3. Backend Integration (FastAPI: http://localhost:8000)

The frontend communicates with Python FastAPI without hardcoding backend secrets or fake ML predictions:

| Function | Endpoint | Description |
| :--- | :--- | :--- |
| `checkBackendHealth()` | `GET /health` | Validates live connection status |
| `uploadEEG(file)` | `POST /analyze` | Multipart form upload of `.edf` or `.csv` |
| `getAnalysis(id)` | `GET /analysis/{id}` | Fetches scored epochs, stages, and metrics |
| `getRecommendations(id)`| `GET /recommendations/{id}` | Returns Gemini LLM recommendations & habits |
| `sendAssistantMessage(...)` | `POST /assistant/chat` | Interactive Q&A on report context |
| `getSleepHistory()` | `GET /history` | Historical session recordings |

### Clinical Data Integrity Policy:
When the FastAPI backend is offline:
- The dashboard, analysis detail, and assistant display baseline clinical reference data.
- File upload operations report server connectivity status with diagnostic instructions.

---

## 4. Running the Development Server

Navigate to the `frontend` folder and run:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To produce an optimized production build:
```bash
npm run build
npm start
```


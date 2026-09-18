# PAIMANA INSIGHT

AI-powered predictive monitoring prototype for infrastructure projects.

## MVP direction
PAIMANA/OCMS-style project data -> validation -> feature engineering -> ML risk prediction -> explanations -> alerts -> dashboards -> project assistant.

This first scaffold implements the Phase 1 foundation:
- project/project-update/milestone data models
- sample synthetic data
- feature-engineering module
- FastAPI backend
- React + Vite frontend shell

## Run backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Data note
The prototype uses synthetic data. It does not claim access to confidential/live PAIMANA data.

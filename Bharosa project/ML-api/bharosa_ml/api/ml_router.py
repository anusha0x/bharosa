from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import sys
import pathlib

# Add src/ to path so we can import predict.py
sys.path.append(str(pathlib.Path(__file__).parent.parent / "src"))

from predict import predict_schemes, load_model

# ── What is this file? ────────────────────────────────────────────────────────
# ml_router.py wraps your ML pipeline in a REST API.
# Your backend teammate calls POST /ml/rank-schemes with a user profile
# and gets back a ranked list of schemes with probability scores.
#
# FastAPI automatically generates docs at http://localhost:8000/docs
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="BHAROSA ML Engine",
    description="Scheme ranking and approval probability scoring",
    version="1.0.0"
)

# ── Load model once at startup ────────────────────────────────────────────────
# We load the model when the server starts, not on every request.
# This is important for performance — loading from disk is slow.
try:
    MODEL, SCALER = load_model()
    print("✅ ML model loaded successfully")
except FileNotFoundError as e:
    print(f"❌ {e}")
    MODEL, SCALER = None, None


# ── Request schema ────────────────────────────────────────────────────────────
# Pydantic BaseModel = automatic input validation.
# If backend sends wrong types, FastAPI rejects it before your code runs.
class UserProfile(BaseModel):
    user_id:         str   = Field(..., example="u1234")
    income:          int   = Field(..., example=90000,  description="Annual income in INR")
    state:           str   = Field(..., example="Maharashtra")
    category:        str   = Field(..., example="OBC",  description="General/OBC/SC/ST/EWS/Minority")
    academic_year:   int   = Field(..., example=2,      description="Current year of study (1-4)")
    has_caste_cert:  int   = Field(..., example=1,      description="1 if document present, 0 if not")
    has_income_cert: int   = Field(..., example=1)
    has_marksheet:   int   = Field(..., example=1)


# ── Response schema ───────────────────────────────────────────────────────────
class SchemeResult(BaseModel):
    scheme_id:   str
    scheme_name: str
    eligible:    bool
    probability: float
    confidence:  str          # "High" / "Medium" / "Low" / "Not Eligible"


# ── Health check endpoint ─────────────────────────────────────────────────────
# Always useful — lets frontend/backend verify the ML server is running
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": MODEL is not None,
        "version": "1.0.0"
    }


# ── Main prediction endpoint ──────────────────────────────────────────────────
# POST /ml/rank-schemes
# Backend sends user profile → gets back ranked schemes
@app.post("/ml/rank-schemes", response_model=list[SchemeResult])
def rank_schemes(user: UserProfile):
    if MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Run train.py first."
        )

    try:
        user_dict = user.model_dump()
        results   = predict_schemes(user_dict, model=MODEL, scaler=SCALER)
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Run the server ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_router:app", host="0.0.0.0", port=8000, reload=True)
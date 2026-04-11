import pandas as pd
import numpy as np
import joblib
import pathlib

from features import build_features, get_feature_columns

# ── What is this file? ────────────────────────────────────────────────────────
# predict.py is the "inference" step — used in production.
# It loads the already-trained model and scaler from disk,
# takes a new user profile, and returns ranked schemes with scores.
#
# train.py runs ONCE (or when retraining).
# predict.py runs EVERY TIME a user submits their profile.
# ─────────────────────────────────────────────────────────────────────────────

# ── Scheme definitions (same as synthetic_data.py) ───────────────────────────
# In a real system this would come from your database.
# For now, hardcoded here so predict.py is self-contained.
SCHEMES = [
    {"scheme_id": "s01", "name": "NSP Central OBC Scholarship",
     "income_limit": 150000, "categories": ["OBC"], "states": "all", "min_year": 1},
    {"scheme_id": "s02", "name": "NSP SC Post Matric",
     "income_limit": 250000, "categories": ["SC"], "states": "all", "min_year": 1},
    {"scheme_id": "s03", "name": "NSP ST Scholarship",
     "income_limit": 250000, "categories": ["ST"], "states": "all", "min_year": 1},
    {"scheme_id": "s04", "name": "Minority Pre Matric Scholarship",
     "income_limit": 100000, "categories": ["Minority"], "states": "all", "min_year": 1},
    {"scheme_id": "s05", "name": "Maharashtra EBC Scholarship",
     "income_limit": 200000, "categories": ["General", "EWS"],
     "states": ["Maharashtra"], "min_year": 1},
    {"scheme_id": "s06", "name": "Bihar SC/ST Merit Scholarship",
     "income_limit": 300000, "categories": ["SC", "ST"],
     "states": ["Bihar"], "min_year": 2},
    {"scheme_id": "s07", "name": "Tamil Nadu First Graduate Scheme",
     "income_limit": 200000, "categories": ["General", "OBC", "SC", "ST"],
     "states": ["Tamil Nadu"], "min_year": 1},
    {"scheme_id": "s08", "name": "Rajasthan Ambedkar Fellowship",
     "income_limit": 250000, "categories": ["SC", "ST"],
     "states": ["Rajasthan"], "min_year": 3},
    {"scheme_id": "s09", "name": "NSP EWS Central Scheme",
     "income_limit": 800000, "categories": ["EWS"], "states": "all", "min_year": 1},
    {"scheme_id": "s10", "name": "Karnataka Sanchi Honnamma Scholarship",
     "income_limit": 150000, "categories": ["OBC", "SC", "ST"],
     "states": ["Karnataka"], "min_year": 2},
]


def check_eligibility(user, scheme):
    """Deterministic rules check — same logic as synthetic_data.py."""
    if user["income"] > scheme["income_limit"]:
        return 0
    if user["category"] not in scheme["categories"]:
        return 0
    if scheme["states"] != "all" and user["state"] not in scheme["states"]:
        return 0
    if user["academic_year"] < scheme["min_year"]:
        return 0
    return 1


def load_model():
    """
    Loads model and scaler from disk.
    Called once when the API starts up — not on every request.
    """
    model_path  = pathlib.Path("models/ranker_model.pkl")
    scaler_path = pathlib.Path("models/scaler.pkl")

    if not model_path.exists() or not scaler_path.exists():
        raise FileNotFoundError(
            "Model files not found. Run train.py first."
        )

    model  = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    return model, scaler


def predict_schemes(user_profile: dict, model=None, scaler=None) -> list:
    """
    Main prediction function.

    Input: user_profile dict with keys:
        user_id, income, state, category, academic_year,
        has_caste_cert, has_income_cert, has_marksheet

    Output: list of dicts, sorted by probability (highest first).
        Each dict has: scheme_id, scheme_name, eligible, probability, confidence
    """

    # Load model if not passed in (useful for one-off calls)
    if model is None or scaler is None:
        model, scaler = load_model()

    results = []

    for scheme in SCHEMES:
        eligible = check_eligibility(user_profile, scheme)

        if not eligible:
            # Rules engine says NO — ML doesn't even get called
            results.append({
                "scheme_id":   scheme["scheme_id"],
                "scheme_name": scheme["name"],
                "eligible":    False,
                "probability": 0.0,
                "confidence":  "Not Eligible",
            })
            continue

        # ── Build a single-row dataframe for this (user, scheme) pair ────────
        # We need to match the exact format that build_features() expects
        row = {
            **user_profile,
            "scheme_id":    scheme["scheme_id"],
            "scheme_name":  scheme["name"],
            "income_limit": scheme["income_limit"],
            "min_year":     scheme["min_year"],
            "eligible":     1,
            "approved":     0,              # placeholder, not used in predict
            "approval_probability": 0.0,    # placeholder
        }

        df_row     = pd.DataFrame([row])
        df_feat    = build_features(df_row)
        FEAT_COLS  = get_feature_columns()

        X          = df_feat[FEAT_COLS]
        X_scaled   = scaler.transform(X)

        # predict_proba returns [prob_rejected, prob_approved]
        # [:, 1] = take the "approved" probability
        prob = model.predict_proba(X_scaled)[0][1]
        prob = round(float(prob), 4)

        # ── Human-readable confidence label ───────────────────────────────────
        if prob >= 0.80:
            confidence = "High"
        elif prob >= 0.60:
            confidence = "Medium"
        else:
            confidence = "Low"

        results.append({
            "scheme_id":   scheme["scheme_id"],
            "scheme_name": scheme["name"],
            "eligible":    True,
            "probability": prob,
            "confidence":  confidence,
        })

    # Sort: eligible first, then by probability descending
    results.sort(key=lambda x: (x["eligible"], x["probability"]), reverse=True)
    return results


# ── Test with a sample user ───────────────────────────────────────────────────
if __name__ == "__main__":

    # Test Case 1: Strong OBC candidate
    test_user = {
        "user_id":          "test_001",
        "income":           90000,
        "state":            "Maharashtra",
        "category":         "OBC",
        "academic_year":    2,
        "has_caste_cert":   1,
        "has_income_cert":  1,
        "has_marksheet":    1,
    }

    print("🧪 Test User Profile:")
    for k, v in test_user.items():
        print(f"   {k}: {v}")

    print("\n📊 Scheme Rankings:")
    print("-" * 65)

    rankings = predict_schemes(test_user)

    for i, r in enumerate(rankings, 1):
        if r["eligible"]:
            print(
                f"  {i}. [{r['confidence']:<6}] {r['scheme_name']:<40} "
                f"  Score: {r['probability']:.2%}"
            )

    print("\n--- Ineligible schemes (ruled out) ---")
    for r in rankings:
        if not r["eligible"]:
            print(f"  ✗ {r['scheme_name']}")
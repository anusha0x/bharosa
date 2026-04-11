import pandas as pd
import numpy as np

# ── What is this file? ────────────────────────────────────────────────────────
# features.py transforms raw user + scheme data into numbers the ML model
# can actually learn from. Think of it as "translating" human-readable
# profile data into mathematical signals.
#
# Rule of thumb: if a human expert would consider a factor when judging
# an application, it should probably be a feature.
# ─────────────────────────────────────────────────────────────────────────────

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Takes the raw synthetic (or real) dataframe and returns
    a new dataframe with engineered features ready for ML.

    Input columns expected:
        income, income_limit, category, scheme categories (as string),
        state, scheme states, academic_year, min_year,
        has_caste_cert, has_income_cert, has_marksheet

    Output: same df + new feature columns
    """

    features = pd.DataFrame()

    # ── Feature 1: Income Ratio ───────────────────────────────────────────────
    # How much of the income limit is the user using up?
    # 0.3 = very low income (strong candidate)
    # 0.95 = income right at the limit (borderline, riskier)
    # This is more informative than raw income alone.
    features["income_ratio"] = df["income"] / df["income_limit"]

    # ── Feature 2: Income Gap (absolute) ─────────────────────────────────────
    # How many rupees BELOW the limit is the user?
    # Larger gap = safer = higher approval chance
    features["income_gap"] = df["income_limit"] - df["income"]

    # ── Feature 3: Document Completeness Score ────────────────────────────────
    # 0.0 = no documents, 1.0 = all documents present
    # Officers processing applications care a lot about this.
    features["doc_completeness"] = (
        df["has_caste_cert"] +
        df["has_income_cert"] +
        df["has_marksheet"]
    ) / 3.0

    # ── Feature 4: Academic Year (normalized) ─────────────────────────────────
    # Higher year students may have more experience applying = slightly better.
    # Dividing by 4 brings it to 0–1 range (normalization).
    # ML models prefer features in similar ranges.
    features["academic_year_norm"] = df["academic_year"] / 4.0

    # ── Feature 5: Year Eligibility Margin ───────────────────────────────────
    # How many years ABOVE the minimum year is the student?
    # 0 = just barely eligible, 3 = well above minimum
    features["year_margin"] = df["academic_year"] - df["min_year"]

    # ── Feature 6: Has All Documents ─────────────────────────────────────────
    # Binary flag: 1 if they have every single document, else 0
    # Simple but powerful signal
    features["has_all_docs"] = (
        (df["has_caste_cert"] == 1) &
        (df["has_income_cert"] == 1) &
        (df["has_marksheet"] == 1)
    ).astype(int)

    # ── Feature 7: Category Risk Score ───────────────────────────────────────
    # Based on historical approval patterns in India's scholarship system.
    # SC/ST schemes tend to have higher approval (more govt focus).
    # General category has highest competition.
    # These weights are our domain knowledge encoded as numbers.
    category_weights = {
        "SC": 0.85,
        "ST": 0.83,
        "OBC": 0.75,
        "Minority": 0.72,
        "EWS": 0.70,
        "General": 0.60,
    }
    features["category_score"] = df["category"].map(category_weights).fillna(0.65)

    # ── Feature 8: Is Low Income ──────────────────────────────────────────────
    # Binary flag: income below 1.5 lakh = typically prioritized
    features["is_low_income"] = (df["income"] < 150000).astype(int)

    # ── Feature 9: State Match ────────────────────────────────────────────────
    # Already computed during eligibility check, but useful as ML feature too.
    # 1 = user's state matches scheme's target state (or scheme is national)
    features["state_match"] = df["eligible"].copy()  # if eligible, state matched

    # ── Feature 10: Interaction Feature ──────────────────────────────────────
    # Combining income_ratio × doc_completeness
    # A student who is low income AND has full docs = strongest candidate
    # This "interaction" captures combined effect, not just individual ones.
    features["income_doc_interaction"] = (
        (1 - features["income_ratio"]) * features["doc_completeness"]
    )

    # ── Target variable ───────────────────────────────────────────────────────
    # This is what we're trying to PREDICT.
    # approved = 1 means application was successful
    features["approved"] = df["approved"]
    features["approval_probability"] = df["approval_probability"]

    # Keep identifiers for reference (not used in training)
    features["user_id"] = df["user_id"]
    features["scheme_id"] = df["scheme_id"]
    features["scheme_name"] = df["scheme_name"]
    features["eligible"] = df["eligible"]

    return features


def get_feature_columns():
    """
    Returns the exact list of feature column names used for training.
    Keeping this in one place means train.py and predict.py
    always use the SAME features — consistency is critical in ML.
    """
    return [
        "income_ratio",
        "income_gap",
        "doc_completeness",
        "academic_year_norm",
        "year_margin",
        "has_all_docs",
        "category_score",
        "is_low_income",
        "state_match",
        "income_doc_interaction",
    ]


# ── Quick test when run directly ──────────────────────────────────────────────
if __name__ == "__main__":
    df_raw = pd.read_csv("data/processed/synthetic_users.csv")

    # Only build features for eligible records
    # (no point training on ineligible — they're always rejected)
    df_eligible = df_raw[df_raw["eligible"] == 1].copy()

    df_features = build_features(df_eligible)

    print(f"✅ Features built for {len(df_features)} eligible records")
    print(f"\nFeature columns: {get_feature_columns()}")
    print(f"\nSample feature values:")
    print(df_features[get_feature_columns()].describe().round(3))
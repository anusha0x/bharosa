import pandas as pd
import numpy as np
import os
import pathlib

# ── Reproducibility ──────────────────────────────────────────────────────────
# Setting a seed means every time you run this, you get the SAME random data.
# Important for consistent model training.
np.random.seed(42)

NUM_SAMPLES = 1000  # 1000 fake students

# ── Master Lists ─────────────────────────────────────────────────────────────
STATES = [
    "Maharashtra", "Uttar Pradesh", "Bihar", "Tamil Nadu", "Rajasthan",
    "West Bengal", "Karnataka", "Gujarat", "Madhya Pradesh", "Odisha"
]

CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "Minority"]

# These are your 10 schemes with their eligibility rules baked in.
# This is the RULES ENGINE data — your backend teammate will have a similar structure.
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


# ── Rules Check ───────────────────────────────────────────────────────────────
# This is a PURE rules function — no ML here.
# It returns 1 (eligible) or 0 (not eligible).
# Notice: this mirrors exactly what the backend rules engine will do.
def check_eligibility(user, scheme):
    if user["income"] > scheme["income_limit"]:
        return 0
    if user["category"] not in scheme["categories"]:
        return 0
    if scheme["states"] != "all" and user["state"] not in scheme["states"]:
        return 0
    if user["academic_year"] < scheme["min_year"]:
        return 0
    return 1


# ── Main Generator ────────────────────────────────────────────────────────────
def generate_synthetic_data():
    records = []

    for i in range(NUM_SAMPLES):

        # Create one fake student profile
        # p= sets the probability weights so data is realistic
        # (more OBC/SC students than ST, matches India's demographics roughly)
        user = {
            "user_id": f"u{i+1:04d}",
            "income": np.random.choice([
                np.random.randint(50000, 100000),    # low income
                np.random.randint(100000, 250000),   # lower-middle
                np.random.randint(250000, 500000),   # middle
                np.random.randint(500000, 900000),   # upper-middle
            ], p=[0.35, 0.35, 0.20, 0.10]),
            "state": np.random.choice(STATES),
            "category": np.random.choice(
                CATEGORIES, p=[0.20, 0.28, 0.20, 0.12, 0.10, 0.10]
            ),
            "academic_year": np.random.randint(1, 5),
            "has_caste_cert": np.random.choice([0, 1], p=[0.15, 0.85]),
            "has_income_cert": np.random.choice([0, 1], p=[0.10, 0.90]),
            "has_marksheet": np.random.choice([0, 1], p=[0.05, 0.95]),
        }

        # For each student, check against ALL 10 schemes
        for scheme in SCHEMES:
            eligible = check_eligibility(user, scheme)

            # ── Simulating approval probability ──────────────────────────────
            # This is the KEY part ML will learn from.
            # We're saying: "Even among eligible people, not everyone gets approved."
            # Reasons: incomplete docs, high competition, income close to limit, etc.
            if eligible:
                base_prob = 0.70

                # Income close to limit = significantly harder
                income_ratio = user["income"] / scheme["income_limit"]
                prob = base_prob - (0.35 * income_ratio)

                # Documents matter a lot more now
                doc_score = (
                    user["has_caste_cert"] +
                    user["has_income_cert"] +
                    user["has_marksheet"]
                ) / 3
                prob += 0.25 * doc_score

                # Category affects approval significantly
                cat_boost = {
                    "SC": 0.10, "ST": 0.10, "OBC": 0.05,
                    "Minority": 0.03, "EWS": 0.02, "General": -0.05
                }
                prob += cat_boost.get(user["category"], 0)

                # Academic year too early = harder
                if user["academic_year"] == scheme["min_year"]:
                    prob -= 0.10

                # Missing ANY document = big penalty
                if user["has_caste_cert"] == 0:
                    prob -= 0.25
                if user["has_income_cert"] == 0:
                    prob -= 0.20

                prob = round(min(max(prob + np.random.normal(0, 0.05), 0.05), 0.97), 4)
                approved = 1 if np.random.random() < prob else 0
                
            else:
                prob = 0.0
                approved = 0

            # One row = one (student, scheme) pair
            records.append({
                **user,                              # spread all user fields
                "scheme_id": scheme["scheme_id"],
                "scheme_name": scheme["name"],
                "income_limit": scheme["income_limit"],
                "min_year": scheme["min_year"],
                "eligible": eligible,
                "approval_probability": prob,
                "approved": approved,
            })

    df = pd.DataFrame(records)

    # Save to CSV so train.py can load it later
    pathlib.Path("data/processed").mkdir(parents=True, exist_ok=True)
    df.to_csv("data/processed/synthetic_users.csv", index=False)

    print(f"✅ Generated {len(df)} records ({NUM_SAMPLES} users × {len(SCHEMES)} schemes)")
    print(f"   Eligible records : {df['eligible'].sum()}")
    print(f"   Approved records : {df['approved'].sum()}")
    return df


# ── Run directly ──────────────────────────────────────────────────────────────
# This block only runs when you execute THIS file directly.
# When other files import it, this block is skipped.
# That's what  if __name__ == "__main__"  means.
if __name__ == "__main__":
    df = generate_synthetic_data()
    print("\nSample eligible records:")
    print(df[df["eligible"] == 1][["user_id", "category", "state",
                                    "income", "scheme_name",
                                    "approval_probability"]].head(10))
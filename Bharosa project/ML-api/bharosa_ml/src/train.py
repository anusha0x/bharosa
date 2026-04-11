import pandas as pd
import numpy as np
import joblib
import pathlib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    confusion_matrix,
    accuracy_score,
    mean_squared_error,
    mean_absolute_error
)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
# Try XGBoost first; fall back to sklearn GradientBoosting if not installed
try:
    from xgboost import XGBClassifier
    USE_XGBOOST = True
except ImportError:
    from sklearn.ensemble import GradientBoostingClassifier
    USE_XGBOOST = False
    print("⚠️  xgboost not found — using sklearn GradientBoostingClassifier (same family, slightly different params)")

from features import build_features, get_feature_columns

# ── What is this file? ────────────────────────────────────────────────────────
# train.py is the "learning" step.
# It loads the synthetic data → builds features → trains XGBoost → saves model.
#
# You only run this file when you want to (re)train the model.
# The saved .pkl files are what predict.py and the API will actually use.
# ─────────────────────────────────────────────────────────────────────────────

def train():
    print("📦 Loading data...")
    df_raw = pd.read_csv("data/processed/synthetic_users.csv")

    # ── Only train on eligible records ────────────────────────────────────────
    # Ineligible records are ALWAYS rejected (rules engine handles that).
    # ML only needs to learn: among eligible ones, who actually gets approved?
    df_eligible = df_raw[df_raw["eligible"] == 1].copy()
    print(f"   Eligible records to train on: {len(df_eligible)}")

    # ── Build features ────────────────────────────────────────────────────────
    print("⚙️  Engineering features...")
    df_features = build_features(df_eligible)

    FEATURE_COLS = get_feature_columns()
    X = df_features[FEATURE_COLS]   # input features (10 columns)
    y = df_features["approved"]     # target: 1 = approved, 0 = rejected

    print(f"   Class balance → Approved: {y.sum()} | Rejected: {(y==0).sum()}")

    # ── Train / Test Split ────────────────────────────────────────────────────
    # We split data into 80% training, 20% testing.
    # The model NEVER sees test data during training.
    # This lets us honestly evaluate: "how well does it do on unseen data?"
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n📊 Train size: {len(X_train)} | Test size: {len(X_test)}")

    # ── Feature Scaling ───────────────────────────────────────────────────────
    # StandardScaler transforms each feature to mean=0, std=1.
    # XGBoost doesn't strictly need this, but it helps with consistency
    # and is required if you later add Logistic Regression as a comparison.
    # IMPORTANT: fit scaler on TRAIN only, then apply to both train and test.
    # If you fit on all data, you "leak" test info into training = cheating.
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)      # only transform, not fit!

    # ── Train XGBoost ─────────────────────────────────────────────────────────
    # XGBoost = Extreme Gradient Boosting.
    # It builds many small decision trees, each one correcting
    # the mistakes of the previous one. Very powerful for tabular data.
    #
    # Key parameters:
    # n_estimators   = how many trees to build (100 is a good start)
    # max_depth      = how deep each tree goes (3-6 is typical)
    # learning_rate  = how much each tree corrects previous errors
    # eval_metric    = what to optimize for (logloss = good for probability output)
    
    print("\n🤖 Training XGBoost model...")
    # Class imbalance fix:
    # 473 approved vs 134 rejected → ratio = 3.53
    # This tells XGBoost to penalize missing a rejection 3.5x more
    neg = (y_train == 0).sum()
    pos = (y_train == 1).sum()
    spw = round(pos / neg, 2)
    print(f"   scale_pos_weight set to: {spw} (fixes class imbalance)")

    if USE_XGBOOST:
        model = XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            eval_metric="logloss",
            scale_pos_weight=spw,
            random_state=42,
            verbosity=0
        )
    else:
        model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42
        )

    model.fit(X_train_scaled, y_train)

    # ── Evaluate ──────────────────────────────────────────────────────────────
    # predict()      → gives hard labels (0 or 1)
    # predict_proba()→ gives probability scores [prob_rejected, prob_approved]
    # We use [:, 1] to get the "approved" probability column
    y_pred       = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

    print("\n📈 Model Evaluation:")
    print("-" * 40)

    # ROC-AUC: measures how well model separates approved vs rejected.
    # 0.5 = random guessing, 1.0 = perfect. Aim for > 0.75
    auc = roc_auc_score(y_test, y_pred_proba)
    print(f"   ROC-AUC Score : {auc:.4f}")

    # Classification report: precision, recall, f1 per class
    print("\n   Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Rejected", "Approved"]))

    # Confusion matrix: shows where model is right/wrong
    cm = confusion_matrix(y_test, y_pred)
    print(f"   Confusion Matrix:")
    print(f"   True Rejected:  {cm[0][0]} | False Approved: {cm[0][1]}")
    print(f"   False Rejected: {cm[1][0]} | True Approved:  {cm[1][1]}")

    # ── Accuracy ─────────────────────────────────────────────────────────────
    acc = accuracy_score(y_test, y_pred)
    print(f"\n   Accuracy Score : {acc:.4f} ({acc*100:.2f}%)")

    # ── RMSE & MAE (on probability scores) ───────────────────────────────────
    # These measure how far off our probability estimates are
    # from the simulated "true" approval probabilities in the data.
    # Lower is better. RMSE penalises big errors more than MAE.
    prob_true = df_features.loc[X_test.index, "approval_probability"].values
    rmse = np.sqrt(mean_squared_error(prob_true, y_pred_proba))
    mae  = mean_absolute_error(prob_true, y_pred_proba)
    print(f"   RMSE           : {rmse:.4f}")
    print(f"   MAE            : {mae:.4f}")

    # ── Data Leakage Check ────────────────────────────────────────────────────
    # Leakage = when a feature accidentally contains information about
    # the target variable (approved), making the model look better than it is.
    # We check: is any feature suspiciously perfectly correlated with target?
    print(f"\n🔎 Data Leakage Check:")
    print("-" * 40)
    leakage_found = False
    for col in FEATURE_COLS:
        corr = abs(df_features[col].corr(df_features["approved"]))
        if corr > 0.95:
            print(f"   ⚠️  LEAKAGE RISK: {col} correlation = {corr:.4f}")
            leakage_found = True
        else:
            print(f"   ✅ {col:<30} corr with target = {corr:.4f}")
    if not leakage_found:
        print("\n   ✅ No data leakage detected!")

    # ── Correlation Matrix ────────────────────────────────────────────────────
    # Shows how features relate to each other.
    # High correlation between two features = redundancy.
    # We save this as an image file.
    print(f"\n📊 Generating Correlation Matrix...")
    corr_matrix = df_features[FEATURE_COLS + ["approved"]].corr().round(2)

    plt.figure(figsize=(12, 8))
    sns.heatmap(
        corr_matrix,
        annot=True,
        fmt=".2f",
        cmap="coolwarm",
        center=0,
        square=True,
        linewidths=0.5
    )
    plt.title("BHAROSA ML — Feature Correlation Matrix", fontsize=14)
    plt.tight_layout()
    pathlib.Path("data/processed").mkdir(parents=True, exist_ok=True)
    plt.savefig("data/processed/correlation_matrix.png", dpi=150)
    plt.close()
    print(f"   Saved → data/processed/correlation_matrix.png")

    # ── Feature Importance ────────────────────────────────────────────────────
    # Which features did the model find most useful?
    # Great for explaining to hackathon judges HOW your model thinks.
    importances = pd.Series(
        model.feature_importances_,
        index=FEATURE_COLS
    ).sort_values(ascending=False)

    print("\n🔍 Feature Importances (what drives approval predictions):")
    for feat, score in importances.items():
        bar = "█" * int(score * 40)
        print(f"   {feat:<30} {bar} {score:.4f}")

    # ── Save model & scaler ───────────────────────────────────────────────────
    # joblib.dump = saves Python objects to disk as .pkl files
    # This is what predict.py will load to make predictions later
    pathlib.Path("models").mkdir(exist_ok=True)
    
    joblib.dump(model,  "models/ranker_model.pkl")
    joblib.dump(scaler, "models/scaler.pkl")

    # Save category encoder (our manual mapping dict) as pickle too
    category_encoder = {
        "SC": 0.85, "ST": 0.83, "OBC": 0.75,
        "Minority": 0.72, "EWS": 0.70, "General": 0.60
    }
    joblib.dump(category_encoder, "models/category_encoder.pkl")

    # Save feature column list — important for predict.py consistency
    joblib.dump(FEATURE_COLS, "models/feature_cols.pkl")

    # Save all metrics as a dict for reporting
    metrics = {
        "roc_auc":  round(auc, 4),
        "accuracy": round(acc, 4),
        "rmse":     round(rmse, 4),
        "mae":      round(mae, 4),
        "train_size": len(X_train),
        "test_size":  len(X_test),
        "n_features": len(FEATURE_COLS),
        "approved_count": int(pos),
        "rejected_count": int(neg),
    }
    joblib.dump(metrics, "models/metrics.pkl")

    print("\n✅ Model saved          → models/ranker_model.pkl")
    print("✅ Scaler saved         → models/scaler.pkl")
    print("✅ Category encoder     → models/category_encoder.pkl")
    print("✅ Feature cols saved   → models/feature_cols.pkl")
    print("✅ Metrics saved        → models/metrics.pkl")
    print("\n📋 Final Metrics Summary:")
    for k, v in metrics.items():
        print(f"   {k:<20} {v}")

    return model, scaler


if __name__ == "__main__":
    train()
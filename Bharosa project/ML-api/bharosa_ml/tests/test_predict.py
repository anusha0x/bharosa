import sys
import pathlib

# Add src/ to path so we can import from it
sys.path.append(str(pathlib.Path(__file__).parent.parent / "src"))

from predict import predict_schemes, load_model, check_eligibility

# ── Load model once for all tests ─────────────────────────────────────────────
# This runs once before all tests — saves time vs loading per test
MODEL, SCALER = load_model()


# ── Helper: a strong OBC candidate ────────────────────────────────────────────
def obc_user():
    return {
        "user_id":          "test_obc",
        "income":           90000,
        "state":            "Maharashtra",
        "category":         "OBC",
        "academic_year":    2,
        "has_caste_cert":   1,
        "has_income_cert":  1,
        "has_marksheet":    1,
    }

# ── Helper: SC user from Bihar ─────────────────────────────────────────────
def sc_bihar_user():
    return {
        "user_id":          "test_sc_bihar",
        "income":           120000,
        "state":            "Bihar",
        "category":         "SC",
        "academic_year":    2,
        "has_caste_cert":   1,
        "has_income_cert":  1,
        "has_marksheet":    1,
    }

# ── Helper: high income user (should be mostly ineligible) ────────────────────
def rich_user():
    return {
        "user_id":          "test_rich",
        "income":           850000,
        "state":            "Maharashtra",
        "category":         "General",
        "academic_year":    1,
        "has_caste_cert":   0,
        "has_income_cert":  1,
        "has_marksheet":    1,
    }


# ══════════════════════════════════════════════════════════════════════════════
# TEST 1: Basic prediction runs without errors
# ══════════════════════════════════════════════════════════════════════════════
def test_predict_returns_results():
    """predict_schemes should return a list with 10 items (one per scheme)."""
    results = predict_schemes(obc_user(), model=MODEL, scaler=SCALER)
    assert isinstance(results, list), "Result should be a list"
    assert len(results) == 10, f"Expected 10 schemes, got {len(results)}"
    print("✅ test_predict_returns_results passed")


# ══════════════════════════════════════════════════════════════════════════════
# TEST 2: Results are sorted by probability (highest first)
# ══════════════════════════════════════════════════════════════════════════════
def test_results_sorted_by_probability():
    """Eligible schemes should appear before ineligible ones, sorted high→low."""
    results = predict_schemes(obc_user(), model=MODEL, scaler=SCALER)

    # Separate eligible and ineligible
    eligible   = [r for r in results if r["eligible"]]
    ineligible = [r for r in results if not r["eligible"]]

    # Eligible should come first
    eligible_indices   = [i for i, r in enumerate(results) if r["eligible"]]
    ineligible_indices = [i for i, r in enumerate(results) if not r["eligible"]]

    if eligible_indices and ineligible_indices:
        assert max(eligible_indices) < min(ineligible_indices), \
            "Eligible schemes should all appear before ineligible ones"

    # Eligible results should be sorted high → low probability
    probs = [r["probability"] for r in eligible]
    assert probs == sorted(probs, reverse=True), \
        "Eligible schemes should be sorted by probability descending"

    print("✅ test_results_sorted_by_probability passed")


# ══════════════════════════════════════════════════════════════════════════════
# TEST 3: OBC user gets NSP OBC scholarship as top result
# ══════════════════════════════════════════════════════════════════════════════
def test_obc_user_gets_correct_scheme():
    """A low-income OBC user should be eligible for NSP Central OBC Scholarship."""
    results  = predict_schemes(obc_user(), model=MODEL, scaler=SCALER)
    eligible = [r for r in results if r["eligible"]]

    assert len(eligible) >= 1, "OBC user should be eligible for at least 1 scheme"

    scheme_ids = [r["scheme_id"] for r in eligible]
    assert "s01" in scheme_ids, \
        "OBC user with income 90k should be eligible for NSP OBC (s01)"

    print("✅ test_obc_user_gets_correct_scheme passed")


# ══════════════════════════════════════════════════════════════════════════════
# TEST 4: High income user gets mostly ineligible results
# ══════════════════════════════════════════════════════════════════════════════
def test_rich_user_mostly_ineligible():
    """User with income 8.5L should be eligible for very few schemes."""
    results  = predict_schemes(rich_user(), model=MODEL, scaler=SCALER)
    eligible = [r for r in results if r["eligible"]]

    # Only NSP EWS (800k limit) might apply, and they're General category
    # so even that shouldn't match — expect 0 or very few eligible
    assert len(eligible) <= 1, \
        f"Rich General user should have ≤1 eligible scheme, got {len(eligible)}"

    print("✅ test_rich_user_mostly_ineligible passed")


# ══════════════════════════════════════════════════════════════════════════════
# TEST 5: Probability scores are valid (between 0 and 1)
# ══════════════════════════════════════════════════════════════════════════════
def test_probability_values_are_valid():
    """All probability scores should be floats between 0.0 and 1.0."""
    results = predict_schemes(obc_user(), model=MODEL, scaler=SCALER)

    for r in results:
        assert 0.0 <= r["probability"] <= 1.0, \
            f"Invalid probability {r['probability']} for scheme {r['scheme_id']}"

    print("✅ test_probability_values_are_valid passed")


# ══════════════════════════════════════════════════════════════════════════════
# TEST 6: Confidence labels are valid strings
# ══════════════════════════════════════════════════════════════════════════════
def test_confidence_labels_are_valid():
    """Confidence should be one of: High, Medium, Low, Not Eligible."""
    valid_labels = {"High", "Medium", "Low", "Not Eligible"}
    results      = predict_schemes(obc_user(), model=MODEL, scaler=SCALER)

    for r in results:
        assert r["confidence"] in valid_labels, \
            f"Invalid confidence label: {r['confidence']}"

    print("✅ test_confidence_labels_are_valid passed")


# ══════════════════════════════════════════════════════════════════════════════
# TEST 7: SC user from Bihar gets state-specific scheme
# ══════════════════════════════════════════════════════════════════════════════
def test_sc_bihar_user_gets_state_scheme():
    """SC user from Bihar should be eligible for Bihar SC/ST Merit Scholarship."""
    results    = predict_schemes(sc_bihar_user(), model=MODEL, scaler=SCALER)
    scheme_ids = [r["scheme_id"] for r in results if r["eligible"]]

    assert "s06" in scheme_ids, \
        "SC user from Bihar should be eligible for Bihar SC/ST scheme (s06)"

    print("✅ test_sc_bihar_user_gets_state_scheme passed")


# ══════════════════════════════════════════════════════════════════════════════
# TEST 8: Missing documents lowers probability
# ══════════════════════════════════════════════════════════════════════════════
def test_missing_docs_lowers_probability():
    """Same user with missing documents should get lower probability score."""
    user_full_docs = obc_user()
    user_no_docs = {**obc_user(), "has_caste_cert": 0, "has_income_cert": 0, "has_marksheet": 0}

    results_full = predict_schemes(user_full_docs, model=MODEL, scaler=SCALER)
    results_none = predict_schemes(user_no_docs,   model=MODEL, scaler=SCALER)

    # Get s01 probability for both
    prob_full = next((r["probability"] for r in results_full if r["scheme_id"] == "s01"), 0)
    prob_none = next((r["probability"] for r in results_none if r["scheme_id"] == "s01"), 0)

    assert prob_full > prob_none, \
        f"Full docs ({prob_full}) should score higher than missing docs ({prob_none})"

    print(f"✅ test_missing_docs_lowers_probability passed")
    print(f"   Full docs: {prob_full:.2%} | Missing docs: {prob_none:.2%}")


# ══════════════════════════════════════════════════════════════════════════════
# Run all tests
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("🧪 Running BHAROSA ML Tests...\n")

    test_predict_returns_results()
    test_results_sorted_by_probability()
    test_obc_user_gets_correct_scheme()
    test_rich_user_mostly_ineligible()
    test_probability_values_are_valid()
    test_confidence_labels_are_valid()
    test_sc_bihar_user_gets_state_scheme()
    test_missing_docs_lowers_probability()

    print("\n🎉 All tests passed!")
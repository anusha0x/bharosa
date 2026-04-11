const express = require("express");
const router = express.Router();
const { getPrediction } = require("../controllers/mlController");

router.post("/predict", getPrediction);

module.exports = router;
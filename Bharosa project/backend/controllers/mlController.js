const { predictFromML } = require("../services/mlService");

const getPrediction = async (req, res) => {
  try {
    const { input } = req.body;

    const result = await predictFromML(input);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Prediction failed" });
  }
};

module.exports = { getPrediction };
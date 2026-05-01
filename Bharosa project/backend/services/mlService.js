const axios = require("axios");


/**
 * Sends student + scheme data to the Python ML API.
 * @param {Object} inputData - Must now include { ..., gender: "Female" }
 */

const predictFromML = async (inputData) => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/predict", {
      input: inputData
    });

    return response.data;
  } catch (error) {
    console.error("ML API Error:", error.message);
    throw error;
  }
};

module.exports = { predictFromML };
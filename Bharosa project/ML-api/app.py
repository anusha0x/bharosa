from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load all files
model = joblib.load('ranker_model.pkl')
scaler = joblib.load('scaler.pkl')
encoder = joblib.load('category_encoder.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json['input']

        # Example processing (basic)
        data = np.array(data).reshape(1, -1)
        data = scaler.transform(data)

        prediction = model.predict(data)

        return jsonify({
            "result": prediction.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)})

app.run(port=5000)
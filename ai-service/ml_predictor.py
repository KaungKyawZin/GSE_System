import os
import joblib
import pandas as pd


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "gse_failure_model.pkl"
)


def predict_vehicle_failure(vehicle):

    if not os.path.exists(MODEL_PATH):

        return {
            "success": False,
            "message": "AI model file not found"
        }

    try:

        model = joblib.load(
            MODEL_PATH
        )

        data = {
            "mileage": [
                vehicle["mileage"]
            ],

            "engine_hours": [
                vehicle["engine_hours"]
            ],

            "maintenance_count": [
                vehicle["maintenance_count"]
            ],

            "inspection_count": [
                vehicle["inspection_count"]
            ],

            "inspection_fail_count": [
                vehicle["inspection_fail_count"]
            ]
        }

        df = pd.DataFrame(data)

        prediction = model.predict(df)[0]

        probabilities = model.predict_proba(df)[0]

        confidence = round(
            float(
                max(probabilities)
            ) * 100,
            2
        )

        failure_probability = round(
            float(
                probabilities[1]
            ) * 100,
            2
        )

        if failure_probability >= 70:

            risk = "High"

        elif failure_probability >= 40:

            risk = "Medium"

        else:

            risk = "Low"

        if prediction == 1:

            result = "Fail"

            recommendation = (
                "Schedule maintenance "
                "and inspect the vehicle."
            )

        else:

            result = "Pass"

            recommendation = (
                "Vehicle condition is acceptable."
            )

        return {

            "success": True,

            "result": result,

            "confidence": confidence,

            "failure_probability":
                failure_probability,

            "risk": risk,

            "recommendation":
                recommendation
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }
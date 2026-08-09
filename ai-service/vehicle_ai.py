from database import get_connection
from inspection_ai import analyze_inspection
from save_prediction import save_prediction

import joblib
import os
import pandas as pd


# =========================================================
# LOAD ML MODEL
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "gse_failure_model.pkl"
)

model = joblib.load(MODEL_PATH)


# =========================================================
# GET VEHICLE
# =========================================================

def get_vehicle(vehicle_id):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT
            v.vehicle_id,
            v.vehicle_code,
            v.registration_no,
            v.manufacturer,
            v.model,
            v.year_manufactured,
            v.status,
            v.mileage,
            v.engine_hours,

            COUNT(DISTINCT mj.maintenance_id)
                AS maintenance_count,

            COUNT(DISTINCT i.inspection_id)
                AS inspection_count,

            COALESCE(
                SUM(
                    CASE
                        WHEN i.overall_status = 'Failed'
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS inspection_fail_count

        FROM vehicles v

        LEFT JOIN maintenance_jobs mj
            ON v.vehicle_id = mj.vehicle_id

        LEFT JOIN inspections i
            ON v.vehicle_id = i.vehicle_id

        WHERE v.vehicle_id = %s

        GROUP BY
            v.vehicle_id,
            v.vehicle_code,
            v.registration_no,
            v.manufacturer,
            v.model,
            v.year_manufactured,
            v.status,
            v.mileage,
            v.engine_hours
    """

    try:

        cursor.execute(
            sql,
            (vehicle_id,)
        )

        return cursor.fetchone()

    except Exception as e:

        print("Vehicle Query Error:", e)

        return None

    finally:

        cursor.close()
        conn.close()


# =========================================================
# GET LATEST INSPECTION
# =========================================================

def get_latest_inspection(vehicle_id):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT
            inspection_id,
            inspection_date,
            overall_status

        FROM inspections

        WHERE vehicle_id = %s

        ORDER BY inspection_id DESC

        LIMIT 1
    """

    try:

        cursor.execute(
            sql,
            (vehicle_id,)
        )

        return cursor.fetchone()

    except Exception as e:

        print("Inspection Query Error:", e)

        return None

    finally:

        cursor.close()
        conn.close()


# =========================================================
# GET LATEST MEASUREMENT
# =========================================================

def get_latest_measurement(inspection_id):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT
            measurement_id,
            measured_at

        FROM inspection_measurements

        WHERE inspection_id = %s

        ORDER BY measurement_id DESC

        LIMIT 1
    """

    try:

        cursor.execute(
            sql,
            (inspection_id,)
        )

        return cursor.fetchone()

    except Exception as e:

        print("Measurement Query Error:", e)

        return None

    finally:

        cursor.close()
        conn.close()


# =========================================================
# ML PREDICTION
# =========================================================

def ml_prediction(vehicle):

    features = [[
        vehicle["mileage"],
        vehicle["engine_hours"],
        vehicle["maintenance_count"],
        vehicle["inspection_count"],
        vehicle["inspection_fail_count"]
    ]]

    df = pd.DataFrame(
        features,
        columns=[
            "mileage",
            "engine_hours",
            "maintenance_count",
            "inspection_count",
            "inspection_fail_count"
        ]
    )

    prediction = model.predict(df)[0]

    probability = model.predict_proba(df)[0][1]

    confidence = round(
        probability * 100,
        2
    )

    # -----------------------------------------
    # Risk
    # -----------------------------------------

    if confidence >= 70:

        risk = "High"

    elif confidence >= 40:

        risk = "Medium"

    else:

        risk = "Low"

    # -----------------------------------------
    # Result
    # -----------------------------------------

    if prediction == 1:

        result = "Fail"

        recommendation = (
            "Schedule maintenance and "
            "inspect the vehicle."
        )

    else:

        result = "Pass"

        recommendation = (
            "Vehicle condition is acceptable."
        )

    return {

        "result": result,

        "confidence": confidence,

        "failure_probability": confidence,

        "risk": risk,

        "recommendation": recommendation
    }


# =========================================================
# COMPLETE VEHICLE AI ANALYSIS
# =========================================================

def analyze_vehicle(vehicle_id):

    # ==========================================
    # VEHICLE
    # ==========================================

    vehicle = get_vehicle(vehicle_id)

    if vehicle is None:

        return {

            "success": False,

            "message": "Vehicle not found",

            "vehicle_id": vehicle_id
        }

    # ==========================================
    # LATEST INSPECTION
    # ==========================================

    inspection = get_latest_inspection(
        vehicle_id
    )

    if inspection is None:

        return {

            "success": False,

            "message": "No inspection found",

            "vehicle": vehicle
        }

    inspection_id = inspection[
        "inspection_id"
    ]

    # ==========================================
    # MEASUREMENT
    # ==========================================

    measurement = get_latest_measurement(
        inspection_id
    )

    if measurement is None:

        return {

            "success": False,

            "message": "No measurement found",

            "vehicle": vehicle,

            "inspection": inspection
        }

    # ==========================================
    # INSPECTION AI
    # ==========================================

    inspection_result = analyze_inspection(
        inspection_id
    )

    if not inspection_result["success"]:

        return {

            "success": False,

            "message": (
                "Inspection AI analysis failed"
            ),

            "vehicle": vehicle,

            "inspection": inspection,

            "measurement": measurement
        }

    inspection_ai = inspection_result[
        "result"
    ]

    # ==========================================
    # ML PREDICTION
    # ==========================================

    ml_result = ml_prediction(
        vehicle
    )

    # ==========================================
    # SAVE PREDICTION
    # ==========================================

    prediction_data = {

        "vehicle_id": vehicle_id,

        "inspection_id": inspection_id,

        "prediction_type":
            "Combined Vehicle Inspection AI",

        "result":
            inspection_ai["overall_result"],

        "confidence":
            inspection_ai["vehicle_health"],

        "risk":
            inspection_ai["risk_level"],

        "predicted_failure":
            ", ".join(
                problem["item"]
                for problem
                in inspection_ai["problems"]
            ) if inspection_ai["problems"]
            else None,

        "recommendation":
            inspection_ai["recommendation"]
    }

    saved = save_prediction(
        prediction_data
    )

    # ==========================================
    # FINAL JSON
    # ==========================================

    return {

        "success": True,

        "vehicle": vehicle,

        "inspection": inspection,

        "measurement": measurement,

        "inspection_ai": inspection_ai,

        "ml_prediction": {

            "success": True,

            **ml_result

        },

        "prediction_saved": saved
    }
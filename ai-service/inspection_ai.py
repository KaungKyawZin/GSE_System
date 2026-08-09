
from database import get_connection


# =========================================================
# GET LATEST MEASUREMENT
# =========================================================

def get_measurement(inspection_id):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT
            measurement_id,
            inspection_id,
            vehicle_id,

            engine_oil_level,
            brake_condition,
            tire_pressure,
            battery_voltage,
            coolant_level,
            fuel_level,

            head_light,
            indicator,
            steering_condition,

            measured_by,
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
# ENGINE OIL
# =========================================================

def check_engine_oil(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Engine oil level is missing"
        }

    if value >= 70:
        return {
            "result": "Good",
            "score": 100,
            "message": "Engine oil level is good"
        }

    elif value >= 50:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Engine oil level is low"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Engine oil level is critically low"
        }


# =========================================================
# BRAKE
# =========================================================

def check_brake(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Brake condition is missing"
        }

    value = str(value).strip().lower()

    if value in ["good", "ok", "normal", "working"]:
        return {
            "result": "Good",
            "score": 100,
            "message": "Brake system is good"
        }

    elif value in ["fair", "worn", "warning"]:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Brake system requires inspection"
        }

    elif value in ["bad", "poor", "fail", "failed"]:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Brake system requires immediate maintenance"
        }

    else:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Unknown brake condition"
        }


# =========================================================
# TIRE PRESSURE
# =========================================================

def check_tire_pressure(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Tire pressure is missing"
        }

    if 30 <= value <= 40:
        return {
            "result": "Good",
            "score": 100,
            "message": "Tire pressure is normal"
        }

    elif 25 <= value < 30 or 40 < value <= 45:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Tire pressure should be checked"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Tire pressure is outside the safe range"
        }


# =========================================================
# BATTERY
# =========================================================

def check_battery(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Battery voltage is missing"
        }

    if value >= 12.5:
        return {
            "result": "Good",
            "score": 100,
            "message": "Battery voltage is normal"
        }

    elif value >= 12.0:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Battery voltage is slightly low"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Battery voltage is critically low"
        }


# =========================================================
# COOLANT
# =========================================================

def check_coolant(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Coolant level is missing"
        }

    if value >= 70:
        return {
            "result": "Good",
            "score": 100,
            "message": "Coolant level is sufficient"
        }

    elif value >= 40:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Coolant level is low"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Coolant level is critically low"
        }


# =========================================================
# FUEL
# =========================================================

def check_fuel(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Fuel level is missing"
        }

    if value >= 30:
        return {
            "result": "Good",
            "score": 100,
            "message": "Fuel level is sufficient"
        }

    elif value >= 15:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Fuel level is low"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Fuel level is critically low"
        }


# =========================================================
# HEAD LIGHT
# =========================================================

def check_head_light(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Head light condition is missing"
        }

    value = str(value).strip().lower()

    if value in ["ok", "good", "working", "normal"]:
        return {
            "result": "Good",
            "score": 100,
            "message": "Head light is working properly"
        }

    elif value in ["weak", "dim", "warning"]:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Head light requires inspection"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Head light is not working properly"
        }


# =========================================================
# INDICATOR
# =========================================================

def check_indicator(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Indicator condition is missing"
        }

    value = str(value).strip().lower()

    if value in ["ok", "good", "working", "normal"]:
        return {
            "result": "Good",
            "score": 100,
            "message": "Indicator is working properly"
        }

    elif value in ["weak", "intermittent", "warning"]:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Indicator requires inspection"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Indicator is not working properly"
        }


# =========================================================
# STEERING
# =========================================================

def check_steering(value):

    if value is None:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Steering condition is missing"
        }

    value = str(value).strip().lower()

    if value in ["good", "ok", "normal", "working"]:
        return {
            "result": "Good",
            "score": 100,
            "message": "Steering system is good"
        }

    elif value in ["fair", "warning", "loose"]:
        return {
            "result": "Warning",
            "score": 60,
            "message": "Steering system requires inspection"
        }

    else:
        return {
            "result": "Fail",
            "score": 0,
            "message": "Steering system requires immediate maintenance"
        }


# =========================================================
# ANALYZE MEASUREMENT
# =========================================================

def analyze_measurement(data):

    results = {}

    results["Engine Oil"] = check_engine_oil(
        data.get("engine_oil_level")
    )

    results["Brake"] = check_brake(
        data.get("brake_condition")
    )

    results["Tire Pressure"] = check_tire_pressure(
        data.get("tire_pressure")
    )

    results["Battery"] = check_battery(
        data.get("battery_voltage")
    )

    results["Coolant"] = check_coolant(
        data.get("coolant_level")
    )

    results["Fuel"] = check_fuel(
        data.get("fuel_level")
    )

    results["Head Light"] = check_head_light(
        data.get("head_light")
    )

    results["Indicator"] = check_indicator(
        data.get("indicator")
    )

    results["Steering"] = check_steering(
        data.get("steering_condition")
    )

    # =====================================================
    # HEALTH
    # =====================================================

    scores = [
        item["score"]
        for item in results.values()
    ]

    health = round(
        sum(scores) / len(scores),
        2
    ) if scores else 0

    # =====================================================
    # COUNT
    # =====================================================

    good_count = sum(
        1
        for item in results.values()
        if item["result"] == "Good"
    )

    warning_count = sum(
        1
        for item in results.values()
        if item["result"] == "Warning"
    )

    fail_count = sum(
        1
        for item in results.values()
        if item["result"] == "Fail"
    )

    # =====================================================
    # CRITICAL ITEMS
    # =====================================================

    critical_items = [
        "Brake",
        "Battery",
        "Steering"
    ]

    critical_failure = any(
        results[item]["result"] == "Fail"
        for item in critical_items
    )

    # =====================================================
    # RISK
    # =====================================================

    if critical_failure:
        risk = "High"

    elif fail_count > 0:
        risk = "High"

    elif health >= 90:
        risk = "Low"

    elif health >= 70:
        risk = "Medium"

    else:
        risk = "High"

    # =====================================================
    # OVERALL
    # =====================================================

    overall_result = (
        "Fail"
        if fail_count > 0
        else "Pass"
    )

    # =====================================================
    # PROBLEMS
    # =====================================================

    problems = []

    for name, item in results.items():

        if item["result"] in [
            "Warning",
            "Fail"
        ]:

            problems.append({
                "item": name,
                "result": item["result"],
                "message": item["message"]
            })

    # =====================================================
    # RECOMMENDATION
    # =====================================================

    if risk == "High":

        recommendation = (
            "Immediate maintenance is required. "
            "Do not operate the vehicle until "
            "the critical issues are resolved."
        )

    elif risk == "Medium":

        recommendation = (
            "Schedule maintenance soon and "
            "monitor the warning items."
        )

    else:

        recommendation = (
            "Vehicle is in good condition. "
            "Continue normal operation and "
            "routine maintenance."
        )

    return {

        "items": results,

        "vehicle_health": health,

        "risk_level": risk,

        "overall_result": overall_result,

        "good_count": good_count,

        "warning_count": warning_count,

        "fail_count": fail_count,

        "critical_failure": critical_failure,

        "problems": problems,

        "recommendation": recommendation
    }


# =========================================================
# ANALYZE INSPECTION
# =========================================================

def analyze_inspection(inspection_id):

    measurement = get_measurement(
        inspection_id
    )

    if measurement is None:

        return {
            "success": False,
            "message": (
                f"No measurement found "
                f"for inspection_id {inspection_id}"
            )
        }

    result = analyze_measurement(
        measurement
    )

    return {

        "success": True,

        "inspection_id":
            measurement["inspection_id"],

        "vehicle_id":
            measurement["vehicle_id"],

        "measurement_id":
            measurement["measurement_id"],

        "measured_at":
            str(measurement["measured_at"]),

        "result":
            result
    }


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    inspection_id = 44

    result = analyze_inspection(
        inspection_id
    )

    print(result)


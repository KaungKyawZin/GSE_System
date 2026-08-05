from database import get_connection


def save_prediction(data):

    conn = get_connection()

    cursor = conn.cursor()


    sql = """
    INSERT INTO ai_predictions
    (
        vehicle_id,
        prediction_type,
        predicted_result,
        confidence,
        risk_level,
        predicted_failure,
        recommendation
    )
    VALUES
    (
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s
    )
    """


    values = (
        int(data["vehicle_id"]),
        "Maintenance Failure Prediction",
        data["result"],
        float(data["confidence"]),
        data["risk"],
        "Vehicle Failure Risk",
        data["recommendation"]
    )


    cursor.execute(
        sql,
        values
    )


    conn.commit()


    cursor.close()
    conn.close()
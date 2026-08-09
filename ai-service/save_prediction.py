from database import get_connection


def save_prediction(data):

    conn = get_connection()

    if conn is None:
        return False

    cursor = conn.cursor()

    sql = """
        INSERT INTO ai_predictions
        (
            vehicle_id,
            inspection_id,
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
            %s,
            %s
        )
    """

    values = (
        int(data["vehicle_id"]),
        data.get("inspection_id"),
        data["prediction_type"],
        data["result"],
        float(data["confidence"]),
        data["risk"],
        data.get("predicted_failure"),
        data["recommendation"]
    )

    try:

        cursor.execute(
            sql,
            values
        )

        conn.commit()

        return True

    except Exception as e:

        conn.rollback()

        print(
            "Save Prediction Error:",
            e
        )

        return False

    finally:

        cursor.close()
        conn.close()
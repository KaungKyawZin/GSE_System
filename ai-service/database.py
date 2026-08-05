import mysql.connector



def get_connection():

    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root@123",
            database="gse_system",
            port=3306
        )
        return connection
    except mysql.connector.Error as e:
            print("Database Connection Error:", e)
            return None

def get_vehicles():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            vehicle_id,
            vehicle_code,
            vehicle_type_id,
            manufacturer,
            year_manufactured,
            status,
            mileage,
            engine_hours
        FROM vehicles
    """)

    vehicles = cursor.fetchall()

    cursor.close()
    conn.close()

    return vehicles

def get_vehicle_ai_data(vehicle_id):


    conn = get_connection()

    cursor = conn.cursor(dictionary=True)



    sql = """

    SELECT


        v.vehicle_id,

        v.mileage,

        v.engine_hours,


        COUNT(DISTINCT m.maintenance_id)
        AS maintenance_count,


        COUNT(DISTINCT i.inspection_id)
        AS inspection_count,


        SUM(

            CASE

                WHEN d.result='Fail'

                THEN 1

                ELSE 0

            END

        )

        AS inspection_fail_count



    FROM vehicles v



    LEFT JOIN maintenance_jobs m

    ON v.vehicle_id = m.vehicle_id



    LEFT JOIN inspections i

    ON v.vehicle_id = i.vehicle_id



    LEFT JOIN inspection_details d

    ON i.inspection_id = d.inspection_id



    WHERE v.vehicle_id=%s



    GROUP BY v.vehicle_id

    """



    cursor.execute(

        sql,

        (vehicle_id,)

    )


    data = cursor.fetchone()



    cursor.close()

    conn.close()



    return data

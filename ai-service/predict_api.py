import sys
import json

from vehicle_ai import analyze_vehicle


def main():

    # ==========================================
    # GET VEHICLE ID
    # ==========================================

    if len(sys.argv) < 2:

        print(json.dumps({
            "success": False,
            "message": "Vehicle ID is required"
        }))

        return

    try:

        vehicle_id = int(sys.argv[1])

    except ValueError:

        print(json.dumps({
            "success": False,
            "message": "Invalid vehicle ID"
        }))

        return

    # ==========================================
    # ANALYZE VEHICLE
    # ==========================================

    result = analyze_vehicle(vehicle_id)

    # ==========================================
    # JSON RESPONSE
    # ==========================================

    print(
        json.dumps(
            result,
            ensure_ascii=False,
            default=str
        )
    )


if __name__ == "__main__":

    main()
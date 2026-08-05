import joblib
import pandas as pd
from database import get_vehicle_ai_data


model = joblib.load(

"model/gse_failure_model.pkl"

)



def predict_vehicle(data):


    df=pd.DataFrame(

        [data]

    )
    


    result=model.predict(df)[0]


    probability=model.predict_proba(df)[0][1]


    confidence=round(

        probability*100,

        2

    )


    if confidence >=70:

        risk="High"


    elif confidence>=40:

        risk="Medium"


    else:

        risk="Low"



    if result==1:

        failure="Fail"

        recommendation="Schedule preventive maintenance"


    else:

        failure="Pass"

        recommendation="Vehicle condition normal"



    return {


        "result":failure,


        "confidence":confidence,


        "risk":risk,


        "recommendation":recommendation

    }

vehicle_id = 1
vehicle = get_vehicle_ai_data(
    vehicle_id
)

# print(vehicle)

vehicle_data = {

"mileage": vehicle["mileage"],

"engine_hours": vehicle["engine_hours"],

"maintenance_count": vehicle["maintenance_count"],

"inspection_count": vehicle["inspection_count"],

"inspection_fail_count": vehicle["inspection_fail_count"]

}



print(

predict_vehicle(vehicle_data)

)
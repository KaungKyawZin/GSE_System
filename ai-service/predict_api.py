import sys
import os
import json
import joblib
import pandas as pd


from database import get_connection
from save_prediction import save_prediction



vehicle_id=sys.argv[1]



BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "gse_failure_model.pkl"
)


model = joblib.load(MODEL_PATH)



conn=get_connection()

cursor=conn.cursor(dictionary=True)



sql="""

SELECT

v.mileage,

v.engine_hours,


COUNT(DISTINCT mj.maintenance_id)
maintenance_count,


COUNT(DISTINCT i.inspection_id)
inspection_count,


SUM(
CASE
WHEN i.overall_status='Failed'
THEN 1
ELSE 0
END
)

inspection_fail_count



FROM vehicles v


LEFT JOIN maintenance_jobs mj

ON v.vehicle_id=mj.vehicle_id


LEFT JOIN inspections i

ON v.vehicle_id=i.vehicle_id



WHERE v.vehicle_id=%s


GROUP BY v.vehicle_id

"""



cursor.execute(
sql,
(vehicle_id,)
)


data=cursor.fetchone()



df=pd.DataFrame(
[data]
)



prediction=model.predict(df)[0]


prob=model.predict_proba(df)[0][1]


confidence=round(
prob*100,
2
)



if confidence>=70:

    risk="High"

elif confidence>=40:

    risk="Medium"

else:

    risk="Low"



if prediction==1:

    result="Fail"

    recommendation="Schedule Maintenance"

else:

    result="Pass"

    recommendation="Vehicle OK"



response={


"vehicle_id":vehicle_id,

"result":result,

"confidence":confidence,

"risk":risk,

"recommendation":recommendation


}

save_prediction(
response
)

print(
json.dumps(response)
)


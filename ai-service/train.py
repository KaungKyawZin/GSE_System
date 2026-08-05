import pandas as pd
import joblib
import os


from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


from database import get_connection



# # =========================
# # Get Data From MySQL
# # =========================



conn = get_connection()



sql = """

SELECT

v.vehicle_id,

v.mileage,

v.engine_hours,


COUNT(DISTINCT mj.maintenance_id)
AS maintenance_count,


COUNT(DISTINCT i.inspection_id)
AS inspection_count,


SUM(
CASE

WHEN i.overall_status='Failed'

THEN 1

ELSE 0

END
)

AS inspection_fail_count



FROM vehicles v


LEFT JOIN maintenance_jobs mj

ON v.vehicle_id = mj.vehicle_id



LEFT JOIN inspections i

ON v.vehicle_id=i.vehicle_id



GROUP BY v.vehicle_id

"""



df = pd.read_sql(sql,conn)

# df = pd.read_csv(
#     "../gse__training_data.csv"
# )

print("\nTraining Data")

print(df)



# =========================
# Create AI Label
# =========================


def create_failure(row):


    if row["mileage"] > 10000:

        return 1


    if row["engine_hours"] > 3000:

        return 1


    if row["inspection_fail_count"] > 0:

        return 1


    if row["maintenance_count"] > 5:

        return 1


    return 0




df["failure"] = df.apply(
    create_failure,
    axis=1
)



print("\nAfter Label")

print(df)



# =========================
# Features
# =========================


X = df[

[
"mileage",

"engine_hours",

"maintenance_count",

"inspection_count",

"inspection_fail_count"

]

]


y=df["failure"]



# =========================
# Split Data
# =========================


X_train,X_test,y_train,y_test = train_test_split(

    X,

    y,

    test_size=0.2,

    random_state=42

)



print(
"Training Data:",
len(X_train)
)


print(
"Testing Data:",
len(X_test)
)



# =========================
# Train Model
# =========================


model = RandomForestClassifier(

    n_estimators=100,

    random_state=42

)



model.fit(

    X_train,

    y_train

)



# =========================
# Accuracy
# =========================


prediction = model.predict(X_test)



accuracy = accuracy_score(

    y_test,

    prediction

)


print(
"Model Accuracy:",
accuracy
)



# =========================
# Save Model
# =========================


os.makedirs(

"model",

exist_ok=True

)



joblib.dump(

model,

"model/gse_failure_model.pkl"

)



print(
"AI Model Saved Successfully"
)
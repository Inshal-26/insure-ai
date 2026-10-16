from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path

app = FastAPI()

MODEL_PATH = Path(__file__).resolve().parent / "insurance_model.pkl"

model = joblib.load(MODEL_PATH)


class InsuranceInput(BaseModel):
    age: int
    sex: str
    bmi: float
    children: int
    smoker: str
    region: str


@app.get("/")
def home():
    return {"message": "Insurance ML API is running"}


@app.post("/predict")
def predict(data: InsuranceInput):

    input_data = pd.DataFrame([{
    "age": data.age,
    "sex": data.sex,
    "bmi": data.bmi,
    "children": data.children,
    "smoker": data.smoker,
    "region": data.region
}])
    prediction = model.predict(input_data)[0]

    return {
        "predicted_charges": round(float(prediction), 2)
    }
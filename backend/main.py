import os
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

from utils import model_service
from utils import email_service
from utils import database

# Initialise SQLite DB (creates tables if missing)
database.init_db()

app = FastAPI(title="Water Contamination Prediction API")

# CORS – allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request schemas ──────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class ResendOTPRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str

class PredictRequest(BaseModel):
    ph: float
    turbidity: float
    tds: float
    temperature: float
    conductivity: float
    dissolved_oxygen: float

class FuturePredictRequest(BaseModel):
    history: List[float]
    steps: int = 5

# ── Auth endpoints ───────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Water Contamination Backend is Running"}


@app.post("/register")
def register(data: RegisterRequest):
    """
    Step 1: Creates an unverified user in the DB, then sends OTP to email.
    Does NOT log the user in – they must verify first.
    """
    # 1. Save user (unverified) to SQLite
    db_result = database.register_user(data.name, data.email, data.password)
    if not db_result["success"]:
        return db_result

    # 2. Send OTP email
    email_result = email_service.send_otp_email(data.email, data.name)
    if not email_result["success"]:
        return {"success": False, "error": f"Account created but email failed: {email_result.get('error')}"}

    return {"success": True, "message": "OTP sent. Please check your email."}


@app.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):
    """
    Step 2: Validates OTP. If correct, marks the user as verified in DB.
    Frontend can now allow login.
    """
    otp_result = email_service.verify_otp(data.email, data.otp)
    if not otp_result["success"]:
        return otp_result

    # Mark verified in DB
    if not database.mark_verified(data.email):
        return {"success": False, "error": "User not found. Please sign up again."}

    # Return user info so frontend can set session immediately
    user = database.get_user(data.email)
    return {"success": True, "user": {"name": user.name, "email": user.email}}


@app.post("/resend-otp")
def resend_otp(data: ResendOTPRequest):
    """Resends an OTP to the given email (must have registered first)."""
    user = database.get_user(data.email)
    if not user:
        return {"success": False, "error": "No account found. Please sign up first."}
    if user.is_verified:
        return {"success": False, "error": "Account already verified. Please log in."}
    result = email_service.send_otp_email(data.email, user.name)
    return result


@app.post("/login")
def login(data: LoginRequest):
    """
    Authenticates a verified user.
    Returns user info on success, error otherwise.
    """
    user_dict, error = database.authenticate_user(data.email, data.password)
    if error:
        return {"success": False, "error": error}
    return {"success": True, "user": user_dict}


# ── Water prediction endpoints ───────────────────────────────────────────

def append_detection_to_history(data: dict, result: dict):
    """Appends a new detection sample to the historical CSV."""
    csv_path = os.path.join(os.path.dirname(__file__), "models", "brisbane_water_quality.csv")
    try:
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            next_record = int(df['Record number'].max()) + 1 if not df.empty else 1000
        else:
            next_record = 1000

        new_row = {
            "Timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Record number": next_record,
            "Temperature": data.get('temperature'),
            "Dissolved Oxygen": data.get('dissolved_oxygen'),
            "pH": data.get('ph'),
            "Specific Conductance": data.get('conductivity'),
            "Turbidity": data.get('turbidity'),
            "Average Water Speed": 0.0,
            "Average Water Direction": 0.0,
            "Chlorophyll": 1.0,
            "Salinity": 35.0,
            "status": result.get('status', 'Unknown')
        }
        new_df = pd.DataFrame([new_row])
        new_df.to_csv(csv_path, mode='a', header=not os.path.exists(csv_path), index=False)
        print(f"Successfully appended record #{next_record} to {csv_path}")
    except Exception as e:
        print(f"Failed to append to history: {e}")


@app.post("/predict")
def predict_contamination(data: PredictRequest):
    """Predicts current water contamination level and persists the data."""
    result = model_service.predict_contamination(data.dict())
    append_detection_to_history(data.dict(), result)
    return result


@app.post("/future-prediction")
def future_prediction(data: FuturePredictRequest):
    """Predicts future contamination over N steps."""
    try:
        preds = model_service.predict_future(data.history, data.steps)
        return [{"day": i + 1, "predicted_value": val, "safety_limit": 5.0} for i, val in enumerate(preds)]
    except Exception as e:
        print(f"Future Prediction Error: {e}")
        ts = [float(i * 1.5 + 4) for i in range(data.steps)]
        return [{"day": i + 1, "predicted_value": val, "safety_limit": 5.0} for i, val in enumerate(ts)]


@app.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    """Uploads new historical data."""
    try:
        contents = await file.read()
        filename = f"models/uploaded_{file.filename}"
        with open(filename, "wb") as f:
            f.write(contents)
        return {"message": "File uploaded successfully"}
    except Exception as e:
        return {"error": str(e)}


@app.get("/analytics")
def get_analytics():
    """Returns analytics data from brisbane_water_quality.csv."""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), "models", "brisbane_water_quality.csv")
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            data = df.tail(50).to_dict(orient='records')
            return {"data": data}
        else:
            return {"error": "CSV data not found."}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow React to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected telemetry payload
class TransferRequest(BaseModel):
    username: str
    amount: float
    is_new_device: bool
    avg_typing_speed_ms: float

# The Risk Engine Endpoint
@app.post("/api/transfer")
def process_transfer(request: TransferRequest):
    trust_score = 100
    risk_factors = []

    # Rule 1: Device Context
    if request.is_new_device:
        trust_score -= 40
        risk_factors.append("Unrecognized Device")

    # Rule 2: Behavioral Anomaly (Typing Speed)
    # If speed is < 50ms per key, it implies copy-paste or a bot script
    if request.avg_typing_speed_ms < 50:
        trust_score -= 30
        risk_factors.append("Anomalous Keystroke Dynamics (Possible Paste/Bot)")

    # Rule 3: Transaction Context
    if request.amount > 10000:
        trust_score -= 20
        risk_factors.append("High Transaction Amount")

    # Decision Matrix
    if trust_score > 70:
        return {"status": "approved", "friction": "none", "score": trust_score, "factors": risk_factors}
    elif trust_score >= 40:
        return {"status": "step-up", "friction": "otp_required", "score": trust_score, "factors": risk_factors}
    else:
        return {"status": "blocked", "friction": "account_locked", "score": trust_score, "factors": risk_factors}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from app.services import StrengthService
from fastapi import FastAPI
from app.services.StrengthService import evaluate

app = FastAPI()

@app.get("/evaluate")
def evaluate_password(password: str, user_inputs: list[str] = []):
    strength = StrengthService.evaluate(password, user_inputs)
    return {"password": password, "strength": strength}

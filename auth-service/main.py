import os
from fastapi import FastAPI, Header, HTTPException, Request
from typing import Optional

app = FastAPI()

VALID_API_KEY = os.getenv('API_KEY')

@app.get("/validate")
async def validate(
    request: Request, 
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_forwarded_for: Optional[str] = Header(None, alias="X-Forwarded-For"),
    x_real_ip: Optional[str] = Header(None, alias="X-Real-IP")
):
    # Get all relevant headers for debugging
    print(f"X-Forwarded-For: {x_forwarded_for}")
    print(f"X-Real-IP: {x_real_ip}")
    print(f"Client Host: {request.client.host}")
    print(f"All headers: {request.headers}")
    
    # API key validation
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    if x_api_key != VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return {"status": "ok"}
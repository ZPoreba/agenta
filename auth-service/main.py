import os
from fastapi import FastAPI, Header, HTTPException, Request
from typing import Optional

app = FastAPI()

VALID_API_KEY = os.getenv('API_KEY')

@app.get("/validate")
async def validate(
    request: Request, 
    authorization: Optional[str] = Header(None),
    x_forwarded_for: Optional[str] = Header(None, alias="X-Forwarded-For"),
    x_real_ip: Optional[str] = Header(None, alias="X-Real-IP")
):
    print(f"X-Forwarded-For: {x_forwarded_for}")
    print(f"X-Real-IP: {x_real_ip}")
    print(f"Client Host: {request.client.host}")
    
    # API key validation
    if not authorization:
        raise HTTPException(status_code=401, detail="API key required")
    
    if authorization != VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return {"status": "ok"}
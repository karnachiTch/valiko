import os
import httpx
from typing import Any, Dict
from fastapi import HTTPException

API_BASE = "https://ipgeolocation.abstractapi.com/v1/"


async def geolocate(ip: str) -> Dict[str, Any]:
    """
    Call AbstractAPI IP geolocation endpoint and return parsed JSON.
    Reads API key from env var `IP_GEO_API_KEY`.
    Raises HTTPException on error.
    """
    api_key = os.getenv("IP_GEO_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="IP_GEO_API_KEY not configured on server")

    params = {"api_key": api_key, "ip_address": ip}
    timeout = httpx.Timeout(10.0, connect=5.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.get(API_BASE, params=params)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Upstream request failed: {e}")

    if resp.status_code != 200:
        # bubble up error message when possible
        detail = None
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        raise HTTPException(status_code=502, detail={"status_code": resp.status_code, "body": detail})

    try:
        return resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse geolocation response: {e}")

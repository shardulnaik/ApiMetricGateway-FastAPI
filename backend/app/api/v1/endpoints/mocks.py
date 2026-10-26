from datetime import datetime
from typing import Optional
from zoneinfo import ZoneInfo

import httpx
from fastapi import APIRouter, Header, HTTPException

from backend.app.core.database import SessionLocal
from backend.app.models.api_key import APIKey

router = APIRouter(prefix="/api/v1", tags=["Mock Services"])
REQUEST_TIMEOUT = httpx.Timeout(8.0, connect=4.0)
MUMBAI_TIMEZONE = ZoneInfo("Asia/Kolkata")


def _require_active_key(x_api_key: Optional[str]) -> None:
    if not x_api_key:
        raise HTTPException(status_code=401, detail="X-API-Key header required")
    session = SessionLocal()
    try:
        key_obj = session.query(APIKey).filter(
            APIKey.key == x_api_key, APIKey.is_active.is_(True)
        ).first()
    finally:
        session.close()
    if not key_obj:
        raise HTTPException(status_code=401, detail="Invalid or Revoked API Key")


def _upstream_get(url: str, service: str, **kwargs):
    try:
        response = httpx.get(url, timeout=REQUEST_TIMEOUT, **kwargs)
        response.raise_for_status()
        return response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Live {service} data is temporarily unavailable. Please try again.",
        ) from exc


def _weather_description(code: int) -> str:
    if code == 0:
        return "Clear sky"
    if code in (1, 2):
        return "Mainly clear" if code == 1 else "Partly cloudy"
    if code == 3:
        return "Overcast"
    if code in (45, 48):
        return "Foggy"
    if code in (51, 53, 55, 56, 57):
        return "Drizzle"
    if code in (61, 63, 65, 66, 67, 80, 81, 82):
        return "Rain"
    if code in (71, 73, 75, 77, 85, 86):
        return "Snow"
    if code in (95, 96, 99):
        return "Thunderstorm"
    return "Weather unavailable"


@router.get("/weather")
def get_weather(x_api_key: Optional[str] = Header(None)):
    _require_active_key(x_api_key)
    data = _upstream_get(
        "https://api.open-meteo.com/v1/forecast",
        "weather",
        params={
            "latitude": 19.0760,
            "longitude": 72.8777,
            "current": "temperature_2m,relative_humidity_2m,weather_code",
            "timezone": "Asia/Kolkata",
        },
    )
    current = data.get("current") or {}
    if any(current.get(field) is None for field in ("temperature_2m", "relative_humidity_2m", "weather_code")):
        raise HTTPException(status_code=502, detail="Live weather data is temporarily unavailable. Please try again.")
    return {
        "service": "Weather API",
        "location": "Mumbai",
        "temperature_c": current["temperature_2m"],
        "condition": _weather_description(int(current["weather_code"])),
        "humidity_percent": current["relative_humidity_2m"],
        "updated_at": datetime.fromisoformat(current["time"]).replace(tzinfo=MUMBAI_TIMEZONE).isoformat(),
    }


@router.get("/stock")
def get_stock(x_api_key: Optional[str] = Header(None)):
    _require_active_key(x_api_key)
    data = _upstream_get(
        "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI",
        "NIFTY 50",
        params={"range": "5d", "interval": "1d", "includePrePost": "false"},
        headers={"User-Agent": "ApiMetric/1.0"},
    )
    chart = data.get("chart") or {}
    result = (chart.get("result") or [None])[0]
    if not result:
        raise HTTPException(status_code=502, detail="Live NIFTY 50 data is temporarily unavailable. Please try again.")
    meta = result.get("meta") or {}
    price = meta.get("regularMarketPrice")
    previous_close = meta.get("chartPreviousClose") or meta.get("previousClose")
    if price is None:
        closes = ((result.get("indicators") or {}).get("quote") or [{}])[0].get("close") or []
        valid_closes = [close for close in closes if close is not None]
        if valid_closes:
            price = valid_closes[-1]
            previous_close = previous_close or (valid_closes[-2] if len(valid_closes) > 1 else None)
    if price is None:
        raise HTTPException(status_code=502, detail="Live NIFTY 50 data is temporarily unavailable. Please try again.")
    change_percent = None
    if previous_close:
        change_percent = round((float(price) - float(previous_close)) / float(previous_close) * 100, 2)
    timestamp = meta.get("regularMarketTime")
    updated_at = datetime.fromtimestamp(timestamp, MUMBAI_TIMEZONE).isoformat() if timestamp else None
    return {
        "service": "Stock API",
        "symbol": "NIFTY 50",
        "price": price,
        "change_percent": change_percent,
        "updated_at": updated_at,
    }


@router.get("/currency")
def get_currency(x_api_key: Optional[str] = Header(None)):
    _require_active_key(x_api_key)
    data = _upstream_get("https://api.frankfurter.dev/v2/rate/usd/inr", "currency", headers={"User-Agent": "ApiMetric/1.0"})
    if not data.get("rate") or not data.get("date"):
        raise HTTPException(status_code=502, detail="Exchange-rate data is temporarily unavailable. Please try again.")
    return {
        "service": "Currency API",
        "pair": "USD/INR",
        "rate": data["rate"],
        "updated_at": data["date"],
    }

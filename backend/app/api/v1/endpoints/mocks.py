from datetime import datetime
import logging
from typing import Optional
from zoneinfo import ZoneInfo

import httpx
from fastapi import APIRouter, Header, HTTPException

from backend.app.core.database import SessionLocal
from backend.app.models.api_key import APIKey

router = APIRouter(prefix="/api/v1", tags=["Mock Services"])
logger = logging.getLogger(__name__)
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
    except httpx.HTTPStatusError as exc:
        logger.warning("%s provider returned HTTP %s", service, exc.response.status_code)
        raise
    except (httpx.RequestError, ValueError) as exc:
        logger.warning("%s provider request failed: %s", service, type(exc).__name__)
        raise


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
    # wttr.in supplies observed current conditions without an API key. Open-Meteo
    # is a live-model fallback for hosts that block or rate-limit the first source.
    wttr_data = None
    try:
        wttr_data = _upstream_get(
            "https://wttr.in/Mumbai?format=j1",
            "weather",
            headers={"User-Agent": "Mozilla/5.0 (compatible; APIMetric/1.0; +https://github.com/)"},
        )
        observed = (wttr_data.get("current_condition") or [None])[0]
        if observed and observed.get("temp_C") is not None and observed.get("humidity") is not None:
            observation_time = observed.get("localObsDateTime") or observed.get("observation_time")
            if observation_time and len(observation_time) == 8 and observation_time.endswith("M"):
                today = datetime.now(MUMBAI_TIMEZONE).strftime("%Y-%m-%d")
                observation_time = f"{today} {observation_time}"
            try:
                updated_at = datetime.strptime(observation_time, "%Y-%m-%d %I:%M %p").replace(tzinfo=MUMBAI_TIMEZONE).isoformat()
            except (TypeError, ValueError):
                updated_at = datetime.now(MUMBAI_TIMEZONE).isoformat()
            description = ((observed.get("weatherDesc") or [{}])[0]).get("value", "Current conditions")
            return {
                "service": "Weather API",
                "location": "Mumbai",
                "temperature_c": float(observed["temp_C"]),
                "condition": description,
                "humidity_percent": int(observed["humidity"]),
                "updated_at": updated_at,
                "data_source": "wttr.in",
            }
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Primary weather source unavailable: %s", type(exc).__name__)

    try:
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
            raise ValueError("weather provider returned incomplete current conditions")
        return {
            "service": "Weather API",
            "location": "Mumbai",
            "temperature_c": current["temperature_2m"],
            "condition": _weather_description(int(current["weather_code"])),
            "humidity_percent": current["relative_humidity_2m"],
            "updated_at": datetime.fromisoformat(current["time"]).replace(tzinfo=MUMBAI_TIMEZONE).isoformat(),
            "data_source": "Open-Meteo",
        }
    except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
        logger.error("All weather sources unavailable: %s", type(exc).__name__)
        raise HTTPException(status_code=502, detail="Live Mumbai weather is temporarily unavailable. Please try again.") from exc


@router.get("/stock")
def get_stock(x_api_key: Optional[str] = Header(None)):
    _require_active_key(x_api_key)
    params = {"range": "1d", "interval": "1m", "includePrePost": "false"}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "application/json,text/plain,*/*",
        "Referer": "https://finance.yahoo.com/",
    }
    result = None
    symbol = None
    last_error = None
    # NIFTY 50 is the primary broad market index; SENSEX is a backup index.
    for host, ticker, label in (
        ("query1.finance.yahoo.com", "%5ENSEI", "NIFTY 50"),
        ("query2.finance.yahoo.com", "%5ENSEI", "NIFTY 50"),
        ("query1.finance.yahoo.com", "%5EBSESN", "SENSEX"),
    ):
        try:
            data = _upstream_get(f"https://{host}/v8/finance/chart/{ticker}", label, params=params, headers=headers)
            result = ((data.get("chart") or {}).get("result") or [None])[0]
            if result:
                symbol = label
                break
        except httpx.HTTPError as exc:
            last_error = exc
    if not result:
        raise HTTPException(status_code=502, detail="Live Indian market data is temporarily unavailable. Please try again.") from last_error
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
        "symbol": symbol,
        "price": price,
        "change_percent": change_percent,
        "updated_at": updated_at,
    }


@router.get("/currency")
def get_currency(x_api_key: Optional[str] = Header(None)):
    _require_active_key(x_api_key)
    try:
        data = _upstream_get("https://api.frankfurter.dev/v2/rate/usd/inr", "currency", headers={"User-Agent": "ApiMetric/1.0"})
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Exchange-rate data is temporarily unavailable. Please try again.") from exc
    if not data.get("rate") or not data.get("date"):
        raise HTTPException(status_code=502, detail="Exchange-rate data is temporarily unavailable. Please try again.")
    return {
        "service": "Currency API",
        "pair": "USD/INR",
        "rate": data["rate"],
        "updated_at": data["date"],
    }

import pandas as pd
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.models.api_key import APIKey
from backend.app.models.request_log import RequestLog


def calculate_user_analytics(db: Session, user_id: int):
    active_key_ids = [row.id for row in db.query(APIKey.id).filter(
        APIKey.user_id == user_id,
        APIKey.is_active.is_(True),
    ).all()]

    if not active_key_ids:
        return {"total_requests": 0, "avg_latency_ms": 0.0, "max_latency_ms": 0.0, "status_breakdown": {}}

    logs = db.query(RequestLog).filter(RequestLog.key_id.in_(active_key_ids)).all()
    if not logs:
        return {"total_requests": 0, "avg_latency_ms": 0.0, "max_latency_ms": 0.0, "status_breakdown": {}}

    df = pd.DataFrame([{
        "status_code": log.status_code,
        "response_time_ms": log.response_time_ms,
    } for log in logs])

    return {
        "total_requests": int(len(df)),
        "avg_latency_ms": float(round(df["response_time_ms"].mean(), 2)),
        "max_latency_ms": float(round(df["response_time_ms"].max(), 2)),
        "status_breakdown": {str(code): int(count) for code, count in df["status_code"].value_counts().items()},
    }


def calculate_admin_analytics(db: Session):
    # Only active credentials participate in admin totals and per-user metrics.
    active_keys = db.query(APIKey).filter(APIKey.is_active.is_(True)).all()
    active_key_ids_by_user = {}
    for key in active_keys:
        active_key_ids_by_user.setdefault(key.user_id, []).append(key.id)

    active_user_ids = set(active_key_ids_by_user)
    users = db.query(User).filter(User.role == "user").all()
    visible_users = [user for user in users if user.id in active_user_ids]
    total_keys = len(active_keys)

    active_key_ids = [key.id for key in active_keys]
    logs = db.query(RequestLog).filter(RequestLog.key_id.in_(active_key_ids)).all() if active_key_ids else []
    df = pd.DataFrame([{
        "key_id": log.key_id,
        "status_code": log.status_code,
        "latency": log.response_time_ms,
    } for log in logs])

    user_activity = []
    for user in visible_users:
        user_key_ids = active_key_ids_by_user[user.id]
        user_df = df[df["key_id"].isin(user_key_ids)] if not df.empty else pd.DataFrame()
        request_count = len(user_df)
        avg_latency = float(round(user_df["latency"].mean(), 2)) if request_count else 0.0

        # Keep all of the user's keys in the key management table while only
        # active keys are counted or used for analytics.
        user_keys = db.query(APIKey).filter(APIKey.user_id == user.id).all()
        user_activity.append({
            "user_id": int(user.id),
            "email": str(user.email),
            "username": user.username,
            "keys": [{"id": key.id, "key": key.key, "is_active": key.is_active} for key in user_keys],
            "total_requests": request_count,
            "avg_latency_ms": avg_latency,
        })

    status_counts = df["status_code"].value_counts().to_dict() if not df.empty else {}
    return {
        "total_system_users": len(visible_users),
        "total_keys_issued": total_keys,
        "total_system_requests": len(df),
        "global_avg_latency_ms": float(round(df["latency"].mean(), 2)) if not df.empty else 0.0,
        "user_activity": user_activity,
        "status_breakdown": {str(code): int(count) for code, count in status_counts.items()},
    }

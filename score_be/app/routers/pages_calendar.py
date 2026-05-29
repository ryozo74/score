import os
from fastapi import APIRouter, Depends, Request
from fastapi.templating import Jinja2Templates
from app.adapters.dto import CalendarUser
from app.deps import get_actor_id, get_actor_role
from app.adapters.calendar_factory import get_calendar_client

router = APIRouter()
_templates = Jinja2Templates(directory="app/templates")

@router.get("/calendar")
def get_calendar(request: Request, actor_id: str = Depends(get_actor_id)):
    from datetime import datetime, timedelta, timezone
    role = get_actor_role(actor_id)
    client = get_calendar_client()
    try:
        user = client.get_me(actor_user_id=actor_id)
    except Exception:
        user = CalendarUser(user_id=0, email="", role="", name="")
    try:
        events = client.get_events(actor_user_id=actor_id)
    except Exception:
        events = []
    # 祝日 (本年)
    today = datetime.now(timezone(timedelta(hours=9)))
    try:
        holidays_raw = client.get_holidays(today.year, actor_user_id=actor_id) or []
        holidays_map = {h.get("date"): h.get("name", "祝日") for h in holidays_raw if h.get("date")}
    except Exception:
        holidays_map = {}

    # 週グリッド構築: 本日を含む週を中心に、先週・今週・来週 (計 21 日)
    weekday_jp = ["月", "火", "水", "木", "金", "土", "日"]
    today_date = today.date()
    this_monday = today_date - timedelta(days=today_date.weekday())  # 月=0
    last_monday = this_monday - timedelta(days=7)
    next_monday = this_monday + timedelta(days=7)
    # 21 日分を組み立て、3 週分のリストに分割
    last_week, this_week, next_week = [], [], []
    for delta in range(21):
        d = last_monday + timedelta(days=delta)
        d_str = d.strftime("%Y-%m-%d")
        wd_idx = d.weekday()
        wd = weekday_jp[wd_idx]
        is_holiday = wd_idx >= 5 or d_str in holidays_map
        holiday_name = holidays_map.get(d_str, "")
        day_events = []
        for ev in (events or []):
            ev_date = ev.get("date") or ev.get("start_time") or ""
            if ev_date.startswith(d_str):
                day_events.append(ev)
        if d < this_monday:
            week_offset = -1
        elif d >= next_monday:
            week_offset = 1
        else:
            week_offset = 0
        entry = {
            "date": d_str,
            "day": d.day,
            "weekday": wd,
            "is_today": d == today_date,
            "is_holiday": is_holiday,
            "holiday_name": holiday_name,
            "events": day_events,
            "week_offset": week_offset,
        }
        (last_week if week_offset == -1 else (next_week if week_offset == 1 else this_week)).append(entry)

    return _templates.TemplateResponse(
        request=request, name="calendar.html",
        context={
            "role": role,
            "active": "calendar",
            "events": events,
            "user": user,
            "week_grid": this_week,        # backward compat (this_week alias)
            "last_week": last_week,
            "this_week": this_week,
            "next_week": next_week,
            "demo_mode": os.getenv("CALENDAR_MOCK", "0") == "1",
        },
    )

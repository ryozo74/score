import os

import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader

from app.adapters.calendar_factory import get_calendar_client
from app.adapters.dto import CalendarUser
from app.deps import get_actor_id, get_actor_role
from app.i18n import get_translator, get_time_greeting_key, t

router = APIRouter()
_templates = Jinja2Templates(
    env=Environment(loader=FileSystemLoader("app/templates"), cache_size=0)
)


@router.get("/dashboard")
def read_dashboard(
    request: Request,
    project_id: int | None = None,
    lang: str = "ja",
    actor_id: str = Depends(get_actor_id),
):
    # Role 別分岐: Director / PM / Lead (Lighting Lead 等) は専用 dashboard へリダイレクト
    role = get_actor_role(actor_id)
    if role == "director":
        return RedirectResponse(url="/director_dashboard", status_code=302)
    if role == "pm":
        return RedirectResponse(url="/pm_dashboard", status_code=302)
    if role in ("lead", "lighting_lead", "kato"):  # 'kato' は旧 alias 後方互換
        return RedirectResponse(url="/lead_dashboard", status_code=302)

    client = get_calendar_client()
    try:
        user = client.get_me(actor_user_id=actor_id)
    except httpx.ConnectError:
        user = CalendarUser(user_id=0, email="", role="", name="")

    try:
        user_projects = client.get_my_projects(actor_user_id=actor_id)
    except httpx.ConnectError:
        user_projects = []

    if project_id is None:
        project_id = user_projects[0]["id"] if user_projects else 1

    try:
        shots = client.get_shots(project_id, actor_user_id=actor_id)
    except httpx.ConnectError:
        shots = []

    # AI プライオリティ提案 — 全 project 全 shot から actor 担当 task を集約・status で重要度 sort
    # 注意: i18n の `t` 関数を shadow せぬよう loop var は `tk` 使用
    my_tasks = []
    try:
        all_projects = user_projects or [{"id": project_id}]
        actor_uid = int(actor_id) if actor_id and actor_id.isdigit() else 0
        for proj in all_projects:
            pid = proj.get("id")
            shots_ = client.get_shots(pid, actor_user_id=actor_id) or []
            for shot in shots_:
                tasks = client.get_tasks(shot.shot_id, actor_user_id=actor_id) or []
                for tk in tasks:
                    if tk.assignee_id == actor_uid:
                        my_tasks.append({
                            "task_id": tk.task_id,
                            "shot_id": shot.shot_id,
                            "shot_code": shot.shot_code or shot.name,
                            "task_type": tk.type,
                            "status": tk.status,
                        })
    except Exception:
        my_tasks = []

    # status 優先度 sort: retake=最優先・reviewing→open→approved 後回し
    _priority_order = {"retake": 0, "reviewing": 1, "open": 2, "in_progress": 3, "approved": 9}
    my_tasks.sort(key=lambda x: _priority_order.get(x["status"], 5))

    trans = get_translator(lang)
    greeting_suffix, greeting_emoji = get_time_greeting_key()
    return _templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={
            "user": user,
            "shots": shots,
            "trans": trans,
            "t": t,
            "user_projects": user_projects,
            "current_project_id": project_id,
            "role": get_actor_role(actor_id),
            "active": "dashboard",
            "greeting_key": f"dashboard.greeting.{greeting_suffix}",
            "greeting_emoji": greeting_emoji,
            "demo_mode": os.getenv("CALENDAR_MOCK", "0") == "1",
            "my_tasks": my_tasks,
        },
    )

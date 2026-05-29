import os
from pathlib import Path

import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader

from app.adapters.calendar_factory import get_calendar_client
from app.deps import get_actor_id, get_actor_role
from app.helpers.project_resolver import resolve_project_name

router = APIRouter()

_env = Environment(
    loader=FileSystemLoader(str(Path(__file__).parent.parent / "templates")),
    cache_size=0,
)
_templates = Jinja2Templates(env=_env)


def _resolve_task(client, shot_id: int, task_id: int | None, actor_id: str):
    """task_id 指定時は当該タスクを探す。なければ None。"""
    if task_id is None:
        return None
    try:
        tlist = client.get_tasks(shot_id, actor_user_id=actor_id) or []
        for t in tlist:
            if getattr(t, "task_id", None) == task_id:
                return t
    except Exception:
        pass
    return None


@router.get("/qc/{id}")
def get_qc_viewer(
    id: int,
    request: Request,
    actor_id: str = Depends(get_actor_id),
    task_id: int | None = None,
):
    client = get_calendar_client()
    try:
        user = client.get_me(actor_user_id=actor_id)
    except Exception:
        user = None
    try:
        tasks = client.get_tasks(id, actor_user_id=actor_id)
    except httpx.ConnectError:
        tasks = []
    shot = client.get_shot(id, actor_user_id=actor_id)
    project_name = resolve_project_name(shot.project_id, actor_id) if shot else "-"
    project_id = shot.project_id if shot else None
    seq_code = getattr(shot, "seq_code", None) if shot else None
    selected_task = _resolve_task(client, id, task_id, actor_id)
    task_name = selected_task.type if selected_task else None

    return _templates.TemplateResponse(
        request=request,
        name="qc_viewer.html",
        context={
            "tasks": tasks, "shot_id": id, "project_name": project_name,
            "project_id": project_id, "seq_code": seq_code,
            "task_id": task_id, "task_name": task_name,
            "role": get_actor_role(actor_id),
            "demo_mode": os.getenv("CALENDAR_MOCK", "0") == "1",
            "user": user,
        },
    )


@router.get("/reference/{id}")
def get_reference_viewer(
    id: int,
    request: Request,
    actor_id: str = Depends(get_actor_id),
    task_id: int | None = None,
):
    client = get_calendar_client()
    try:
        user = client.get_me(actor_user_id=actor_id)
    except Exception:
        user = None
    try:
        tasks = client.get_tasks(id, actor_user_id=actor_id)
    except httpx.ConnectError:
        tasks = []
    shot = client.get_shot(id, actor_user_id=actor_id)
    project_name = resolve_project_name(shot.project_id, actor_id) if shot else "-"
    project_id = shot.project_id if shot else None
    seq_code = getattr(shot, "seq_code", None) if shot else None
    selected_task = _resolve_task(client, id, task_id, actor_id)
    task_name = selected_task.type if selected_task else None

    return _templates.TemplateResponse(
        request=request,
        name="reference_viewer.html",
        context={
            "tasks": tasks, "shot_id": id, "project_name": project_name,
            "project_id": project_id, "seq_code": seq_code,
            "task_id": task_id, "task_name": task_name,
            "demo_mode": os.getenv("CALENDAR_MOCK", "0") == "1",
            "user": user,
        },
    )

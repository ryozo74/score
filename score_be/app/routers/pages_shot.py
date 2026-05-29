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


@router.get("/shot/{id}")
def get_shot_detail(
    id: int,
    request: Request,
    actor_id: str = Depends(get_actor_id),
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
    project_name = (
        resolve_project_name(shot.project_id, actor_id)
        if shot else "-"
    )
    project_id = shot.project_id if shot else None
    seq_code = getattr(shot, "seq_code", None) if shot else None
    task_name = (
        getattr(shot, "shot_code", None) or getattr(shot, "name", None) or f"SHOT_{id:03d}"
    ) if shot else f"SHOT_{id:03d}"

    from app.helpers.colors import attach_task_palettes, get_project_palette
    tasks = attach_task_palettes(tasks)
    project_palette = get_project_palette(project_id) if project_id else None
    return _templates.TemplateResponse(
        request=request,
        name="shot_detail.html",
        context={
            "tasks": tasks,                 # asset history 用 (全工程)
            "upstream_tasks": tasks,        # upstream 可視化用 (同じ全工程)
            "shot_id": id,
            "shot": shot,
            "project_name": project_name,
            "project_id": project_id,
            "project_palette": project_palette,
            "seq_code": seq_code,
            "task_name": task_name,
            "user": user,
            "role": get_actor_role(actor_id),
            "demo_mode": os.getenv("CALENDAR_MOCK", "0") == "1",
            "isolated_task": False,
        },
    )


@router.get("/task/{task_id}")
def get_task_detail(
    task_id: int,
    request: Request,
    actor_id: str = Depends(get_actor_id),
):
    """単独タスクページ — shot_detail.html を流用し isolated 表示 (1 task のみ)."""
    client = get_calendar_client()
    try:
        user = client.get_me(actor_user_id=actor_id)
    except Exception:
        user = None

    # task_id から所属 shot を解決:
    # 優先: client.get_task(task_id) (Calendar /api/tasks/{id})
    # fallback 1: get_my_tasks (actor 関連 task のみ)
    found_task = None
    found_shot_id = None
    found_shotID = None
    found_seqID = None
    found_name = None
    # 優先: 直接 /api/tasks/{id} で取得
    if hasattr(client, "get_task"):
        try:
            raw = client.get_task(task_id, actor_user_id=actor_id) or {}
            if raw and (raw.get("id") == task_id or raw.get("task_id") == task_id):
                found_task = type("_T", (), {
                    "task_id": raw.get("id") or task_id,
                    "shot_id": raw.get("shot_id") or 0,
                    "type": raw.get("type", "Unknown"),
                    "status": raw.get("status", "open"),
                    "assignee_id": raw.get("assigned_to") or raw.get("assignee_id") or 0,
                })()
                found_shot_id = raw.get("shot_id") or 0
                found_shotID = raw.get("shotID")
                found_seqID = raw.get("seqID")
                found_name = raw.get("name")
        except Exception:
            pass
    # fallback 1: get_my_tasks
    if not found_task and hasattr(client, "get_my_tasks"):
        try:
            for raw in (client.get_my_tasks(actor_user_id=actor_id) or []):
                if isinstance(raw, dict) and (raw.get("id") == task_id or raw.get("task_id") == task_id):
                    found_task = type("_T", (), {
                        "task_id": raw.get("id") or raw.get("task_id"),
                        "shot_id": raw.get("shot_id") or 0,
                        "type": raw.get("type", "Unknown"),
                        "status": raw.get("status", "open"),
                        "assignee_id": raw.get("assigned_to") or raw.get("assignee_id") or 0,
                    })()
                    found_shot_id = raw.get("shot_id") or 0
                    found_shotID = raw.get("shotID")
                    found_seqID = raw.get("seqID")
                    found_name = raw.get("name")
                    break
        except Exception:
            pass

    if not found_task:
        # fallback: stub task (task_id を class 内で安全に default 指定)
        _stub = type("_Stub", (), {
            "task_id": task_id,
            "shot_id": 1,
            "type": "Unknown",
            "status": "open",
            "assignee_id": 0,
        })()
        found_task = _stub
        found_shot_id = 1

    # get_shot は found_shot_id が 0/None なら失敗するため try/except
    shot = None
    if found_shot_id:
        try:
            shot = client.get_shot(found_shot_id, actor_user_id=actor_id)
        except Exception:
            shot = None
    # 既存 project_id を Calendar の get_task response からも取得試行 (project_id 不在解消用)
    fetched_project_id = None
    if hasattr(client, "get_task"):
        try:
            raw_full = client.get_task(task_id, actor_user_id=actor_id) or {}
            fetched_project_id = raw_full.get("project_id")
        except Exception:
            pass
    project_id = (shot.project_id if shot else None) or fetched_project_id
    project_name = resolve_project_name(project_id, actor_id) if project_id else "-"
    seq_code = (getattr(shot, "seq_code", None) if shot else None) or found_seqID
    # shot table 不在の場合 found_shotID (文字列・shot_code) を fallback として stub object に
    if not shot and found_shotID:
        shot = type("_ShotStub", (), {
            "shot_id": found_shot_id or 0,
            "shot_code": found_shotID,
            "name": found_shotID,
            "project_id": project_id or 33,
            "status": "",
            "seq_code": found_seqID or "",
        })()
    task_name = found_name or found_task.type or "task"

    # upstream: 同 shotID(shot_code) の全 task を dependsOn chain で sort
    # 表示順: Layout → Animation → Lighting → Composite ... の workflow 順
    upstream_tasks = []
    try:
        # 全 project task を一括 fetch
        all_proj_tasks = []
        if project_id and hasattr(client, "get_tasks_by_project"):
            all_proj_tasks = client.get_tasks_by_project(project_id, actor_user_id=actor_id) or []
        # 同 shotID で filter
        target_shot_code = found_shotID or (shot.shot_code if shot else None)
        same_shot_tasks = []
        if target_shot_code:
            same_shot_tasks = [t for t in all_proj_tasks if (t.get("shotID") or "") == target_shot_code]
        # dependsOn topological sort (chain 順)
        # まず id 別 lookup
        by_id = {str(t.get("id")): t for t in same_shot_tasks}
        # 入次数(依存元なし=0)から topological sort
        from collections import deque
        in_degree = {tid: 0 for tid in by_id}
        for tid, t in by_id.items():
            for dep in (t.get("dependsOn") or []):
                # dep は他 shot を指す場合もある(無関係はスキップ)
                if str(dep) in by_id:
                    in_degree[tid] += 1
        queue = deque([tid for tid, d in in_degree.items() if d == 0])
        sorted_ids = []
        while queue:
            tid = queue.popleft()
            sorted_ids.append(tid)
            for other_tid, t in by_id.items():
                if str(tid) in [str(x) for x in (t.get("dependsOn") or [])]:
                    in_degree[other_tid] -= 1
                    if in_degree[other_tid] == 0:
                        queue.append(other_tid)
        # CalendarTask 風 wrapper に変換
        for tid in sorted_ids:
            t = by_id[tid]
            upstream_tasks.append(type("_TT", (), {
                "task_id": t.get("id"),
                "shot_id": t.get("shot_id") or 0,
                "type": t.get("type", ""),
                "status": t.get("status", ""),
                "assignee_id": t.get("assigned_to") or 0,
                "name": t.get("name", ""),
            })())
        # 何も取れなければ fallback (旧)
        if not upstream_tasks and found_shot_id:
            upstream_tasks = client.get_tasks(found_shot_id, actor_user_id=actor_id) or [found_task]
        elif not upstream_tasks:
            upstream_tasks = [found_task]
    except Exception:
        try:
            upstream_tasks = client.get_tasks(found_shot_id, actor_user_id=actor_id) if found_shot_id else [found_task]
        except Exception:
            upstream_tasks = [found_task]

    return _templates.TemplateResponse(
        request=request,
        name="shot_detail.html",
        context={
            "tasks": [found_task],          # asset history: アイソレーション 単独タスクのみ
            "upstream_tasks": upstream_tasks,  # upstream 可視化: 全工程 (context 保持)
            "shot_id": found_shot_id,
            "shot": shot,
            "task_id": task_id,
            "project_name": project_name,
            "project_id": project_id,
            "seq_code": seq_code,
            "task_name": task_name,
            "user": user,
            "role": get_actor_role(actor_id),
            "isolated_task": True,
            "demo_mode": os.getenv("CALENDAR_MOCK", "0") == "1",
        },
    )

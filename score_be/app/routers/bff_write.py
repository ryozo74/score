"""書込BFF 10EP — calender_api_complete_list.md §8 実在EPのみ (捏造ゼロ)"""
from fastapi import APIRouter, Depends, Path
from fastapi.responses import JSONResponse

from app.adapters.calendar_factory import get_calendar_client
from app.deps import get_actor_id

router = APIRouter()


@router.post("/api/bff/retakes")
def post_retakes(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_retakes(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/shots/{id}/approve")
def post_shot_approve(
    id: int = Path(...),
    body: dict = None,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_shot_approve(id, body or {}, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/look_distributions")
def post_look_distributions(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_look_distributions(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/timecards/clock_out")
def post_timecard_clock_out(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_timecard_clock_out(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/routines")
def post_routines(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_routines(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/change_requests")
def post_change_requests(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_change_requests(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/troubles")
def post_troubles(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_troubles(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.patch("/api/bff/troubles/{id}/resolve")
def patch_trouble_resolve(
    id: int = Path(...),
    body: dict = None,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.patch_trouble_resolve(id, body or {}, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/messages")
def post_messages(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_messages(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.patch("/api/bff/notifications/{id}/read")
def patch_notification_read(
    id: int = Path(...),
    body: dict = None,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.patch_notification_read(id, body or {}, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})

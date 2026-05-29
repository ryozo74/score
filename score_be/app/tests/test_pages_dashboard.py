"""pages_dashboard テスト — GET /dashboard Depends(get_actor_id) + CalendarClient モック検証"""
import os
from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

os.environ.setdefault("JWT_SECRET", "test_secret_key_32bytes_minimum!")

from app.adapters.dto import CalendarShot, CalendarUser
from app.deps import get_actor_id
from app.routers import pages_dashboard

_test_app = FastAPI()
_test_app.include_router(pages_dashboard.router)


@pytest.fixture()
def client():
    with TestClient(_test_app, raise_server_exceptions=False) as c:
        yield c


class TestPagesDashboard:
    def test_dashboard_valid_jwt(self, client):
        mock_user = CalendarUser(user_id=5, email="sato@studio.jp", role="Compositor", name="Sato")
        mock_shots = [
            CalendarShot(shot_id=1, project_id=1, name="SHOT_001", status="retake"),
            CalendarShot(shot_id=2, project_id=1, name="SHOT_002", status="approved"),
        ]
        _test_app.dependency_overrides[get_actor_id] = lambda: "5"
        try:
            with patch("app.routers.pages_dashboard.get_calendar_client") as MockClient:
                mock_inst = MagicMock()
                mock_inst.get_me.return_value = mock_user
                mock_inst.get_shots.return_value = mock_shots
                MockClient.return_value = mock_inst

                resp = client.get("/dashboard")

            assert resp.status_code == 200
            mock_inst.get_me.assert_called_once_with(actor_user_id="5")
            mock_inst.get_shots.assert_called_once()
        finally:
            _test_app.dependency_overrides.pop(get_actor_id, None)

    def test_dashboard_nonexistent_email(self, client):
        def _raise_403():
            raise HTTPException(status_code=403, detail="User not found in Calendar")

        _test_app.dependency_overrides[get_actor_id] = _raise_403
        try:
            resp = client.get("/dashboard")
        finally:
            _test_app.dependency_overrides.pop(get_actor_id, None)

        assert resp.status_code == 403

    def test_dashboard_no_auth(self, client):
        resp = client.get("/dashboard")
        assert resp.status_code == 401

    def test_dashboard_project_id_default_from_my_projects(self, client):
        """project_id 未指定時に get_my_projects() の最初の project を採用"""
        mock_user = CalendarUser(user_id=5, email="ryoji@studio.jp", role="Artist", name="Ryoji")
        mock_projects = [{"id": 33, "name": "Ramps"}]
        mock_shots = [CalendarShot(shot_id=10, project_id=33, name="SHOT_033", status="wip")]
        _test_app.dependency_overrides[get_actor_id] = lambda: "5"
        try:
            with patch("app.routers.pages_dashboard.get_calendar_client") as MockClient:
                mock_inst = MagicMock()
                mock_inst.get_me.return_value = mock_user
                mock_inst.get_my_projects.return_value = mock_projects
                mock_inst.get_shots.return_value = mock_shots
                MockClient.return_value = mock_inst

                resp = client.get("/dashboard")

            assert resp.status_code == 200
            mock_inst.get_my_projects.assert_called_once_with(actor_user_id="5")
            mock_inst.get_shots.assert_called_once_with(33, actor_user_id="5")
        finally:
            _test_app.dependency_overrides.pop(get_actor_id, None)

    def test_dashboard_project_id_query_param_override(self, client):
        """?project_id=1 指定時は get_my_projects() より優先"""
        mock_user = CalendarUser(user_id=5, email="ryoji@studio.jp", role="Artist", name="Ryoji")
        mock_projects = [{"id": 33, "name": "Ramps"}]
        mock_shots = [CalendarShot(shot_id=1, project_id=1, name="SHOT_001", status="approved")]
        _test_app.dependency_overrides[get_actor_id] = lambda: "5"
        try:
            with patch("app.routers.pages_dashboard.get_calendar_client") as MockClient:
                mock_inst = MagicMock()
                mock_inst.get_me.return_value = mock_user
                mock_inst.get_my_projects.return_value = mock_projects
                mock_inst.get_shots.return_value = mock_shots
                MockClient.return_value = mock_inst

                resp = client.get("/dashboard?project_id=1")

            assert resp.status_code == 200
            mock_inst.get_shots.assert_called_once_with(1, actor_user_id="5")
        finally:
            _test_app.dependency_overrides.pop(get_actor_id, None)

    def test_dashboard_project_id_fallback_on_connect_error(self, client):
        """get_my_projects が ConnectError → user_projects=[] → project_id=1 fallback"""
        mock_user = CalendarUser(user_id=5, email="ryoji@studio.jp", role="Artist", name="Ryoji")
        mock_shots = []
        _test_app.dependency_overrides[get_actor_id] = lambda: "5"
        try:
            with patch("app.routers.pages_dashboard.get_calendar_client") as MockClient:
                mock_inst = MagicMock()
                mock_inst.get_me.return_value = mock_user
                mock_inst.get_my_projects.side_effect = httpx.ConnectError("conn refused")
                mock_inst.get_shots.return_value = mock_shots
                MockClient.return_value = mock_inst

                resp = client.get("/dashboard")

            assert resp.status_code == 200
            mock_inst.get_shots.assert_called_once_with(1, actor_user_id="5")
        finally:
            _test_app.dependency_overrides.pop(get_actor_id, None)

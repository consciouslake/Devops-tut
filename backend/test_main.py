from unittest.mock import patch

from fastapi.testclient import TestClient

import rag
from main import app

client = TestClient(app)


async def _fake_stream(*_args, **_kwargs):
    yield "hi"


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "UP"}


def test_chat_ai_mode_skips_retrieval():
    with (
        patch.object(rag, "generate_plain_answer", side_effect=_fake_stream) as plain,
        patch.object(rag, "retrieve") as retrieve,
        patch.object(rag, "generate_answer") as answer,
    ):
        with client.websocket_connect("/chat") as ws:
            ws.send_text('{"query": "hello", "mode": "ai"}')
            assert ws.receive_text() == "hi"
            assert ws.receive_text() == "[[END]]"
        plain.assert_called_once_with("hello")
        retrieve.assert_not_called()
        answer.assert_not_called()


def test_chat_rag_mode_uses_retrieval():
    with (
        patch.object(rag, "retrieve", return_value=[]) as retrieve,
        patch.object(rag, "generate_answer", side_effect=_fake_stream) as answer,
        patch.object(rag, "generate_plain_answer") as plain,
    ):
        with client.websocket_connect("/chat") as ws:
            ws.send_text('{"query": "hello", "mode": "rag"}')
            assert ws.receive_text() == "hi"
            assert ws.receive_text() == "[[END]]"
        retrieve.assert_called_once_with("hello")
        answer.assert_called_once()
        plain.assert_not_called()


def test_chat_defaults_to_rag_for_plain_text():
    with (
        patch.object(rag, "retrieve", return_value=[]) as retrieve,
        patch.object(rag, "generate_answer", side_effect=_fake_stream),
    ):
        with client.websocket_connect("/chat") as ws:
            ws.send_text("hello")
            ws.receive_text()
            ws.receive_text()
        retrieve.assert_called_once_with("hello")

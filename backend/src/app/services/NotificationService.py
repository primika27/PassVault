import asyncio
from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            conns = self.active_connections.setdefault(user_id, set())
            conns.add(websocket)

    async def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            conns = self.active_connections.get(user_id)
            if not conns:
                return
            conns.discard(websocket)
            if not conns:
                self.active_connections.pop(user_id, None)

    async def notify_user_verified(self, user_id: str) -> None:
        # send a small JSON payload to all connected sockets for user_id
        async with self._lock:
            conns = list(self.active_connections.get(user_id, set()))

        payload = {"verified": True, "user_id": user_id}

        for ws in conns:
            try:
                await ws.send_json(payload)
                await ws.close()
            except Exception:
                # ignore individual send failures
                try:
                    await ws.close()
                except Exception:
                    pass


_manager = ConnectionManager()


def get_manager() -> ConnectionManager:
    return _manager


def notify_user_verified(user_id: str) -> None:
    """Schedule a notification to all websockets connected for `user_id`.

    This is a fire-and-forget call; it schedules an async task to do the real sends.
    """
    asyncio.create_task(_manager.notify_user_verified(user_id))

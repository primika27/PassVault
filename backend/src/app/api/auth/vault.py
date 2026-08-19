# app/routers/vault.py
from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from backend.src.app.api.auth.routes import SESSION_COOKIE
from backend.src.app.services import UserService

router = APIRouter(prefix="/vault", tags=["vault"])

@router.get("", response_model=dict)
def get_all_vault_items(session_id: str | None = Cookie(default=None, alias=SESSION_COOKIE)):
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session cookie missing or expired."
        )
    
    # Resolves user_id internally from sessions table using session_id
    vault_items = UserService.get_all_vault_items(session_id=session_id)
    return {"vault": vault_items}

@router.get("/{item_id}", response_model=dict)
def get_single_vault_item(
    item_id: str,
    session_id: str | None = Cookie(default=None, alias=SESSION_COOKIE)
):
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session cookie missing or expired."
        )
    
    # Ensures item belongs to the user matching this session_id
    vault_item = UserService.get_vault_item_by_id(session_id=session_id, item_id=item_id)
    if not vault_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault item not found")
        
    return {"vault_item": vault_item}

@router.post("", response_model=dict)
def create_vault_item(
    item_data: dict,
    session_id: str | None = Cookie(default=None, alias=SESSION_COOKIE)
):
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session cookie missing or expired."
        )

    new_item = UserService.create_vault_item(session_id=session_id, item_data=item_data)
    return {"vault_item": new_item}
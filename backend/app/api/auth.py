from datetime import timedelta
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from jose import JWTError, jwt

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.dependencies import get_db, get_current_user
from app.models import User
from app.schemas.auth import LoginRequest, Token, UserRead, UserCreate

router = APIRouter()

@router.post('/login', response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    登录接口 - 支持邮箱或手机号登录
    form_data.username 可以是邮箱或手机号
    """
    user = None
    
    # 判断是邮箱还是手机号
    username = form_data.username.strip()
    
    if '@' in username:
        # 邮箱登录
        user = db.query(User).filter(User.email == username).first()
    else:
        # 手机号登录
        user = db.query(User).filter(User.phone == username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='账号或密码错误',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={'sub': str(user.id), 'role': user.role},
        expires_delta=access_token_expires,
    )
    return {'access_token': access_token, 'token_type': 'bearer'}


@router.post('/register', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Email must be unique."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='User already exists')

    hashed = get_password_hash(payload.password)
    user = User(email=payload.email, password_hash=hashed, role=payload.role or 'admin')
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post('/refresh', response_model=Token)
def refresh_access_token(body: Dict[str, str] = Body(...), db: Session = Depends(get_db)):
    """Issue a new access token based on an existing token's subject.

    This implementation accepts a token (even expired) and, if the subject
    corresponds to an existing user, issues a fresh access token. It's a
    lightweight refresh flow suitable for dev/testing; consider implementing
    proper refresh tokens for production.
    """
    token = body.get('token')
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='token required')

    try:
        # decode without verifying expiration to extract subject
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm], options={"verify_exp": False})
        user_id = int(payload.get('sub'))
    except (JWTError, Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(data={'sub': str(user.id), 'role': user.role}, expires_delta=access_token_expires)
    return {'access_token': access_token, 'token_type': 'bearer'}


@router.get('/me', response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


from pydantic import BaseModel as PydanticBaseModel

class SmsSendRequest(PydanticBaseModel):
    phone: str


@router.post('/send-sms')
def send_sms(req: SmsSendRequest):
    """发送短信验证码（Mock实现，始终返回成功）"""
    if not req.phone or len(req.phone) != 11:
        raise HTTPException(status_code=400, detail='请输入正确的手机号')
    return {'message': f'验证码已发送至 {req.phone}', 'code': '123456'}

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')
ALGORITHM = 'HS256'


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt 对输入长度有限制（72 bytes），对比时也需要使用相同的截断规则
    try:
        pw_bytes = plain_password.encode('utf-8')[:72]
    except Exception:
        pw_bytes = plain_password
    return pwd_context.verify(pw_bytes, hashed_password)


def get_password_hash(password: str) -> str:
    # bcrypt 最多处理前 72 字节，超过部分需手动截断以避免 ValueError
    try:
        pw_bytes = password.encode('utf-8')[:72]
    except Exception:
        pw_bytes = password
    return pwd_context.hash(pw_bytes)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError as exc:
        raise exc

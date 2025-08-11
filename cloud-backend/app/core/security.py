from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

# 密码加密上下文 - 使用 bcrypt 算法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    创建 JWT 访问令牌
    
    Args:
        subject: 令牌主体（通常是用户ID）
        expires_delta: 过期时间差，如果不提供则使用配置中的默认值
        
    Returns:
        编码后的 JWT 令牌字符串
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject), "iat": datetime.now(timezone.utc)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证原始密码与哈希密码是否匹配
    
    Args:
        plain_password: 原始密码
        hashed_password: 哈希后的密码
        
    Returns:
        密码是否匹配
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    生成密码的哈希值
    
    Args:
        password: 原始密码
        
    Returns:
        哈希后的密码字符串
    """
    return pwd_context.hash(password)


def verify_token(token: str) -> Optional[str]:
    """
    验证 JWT 令牌并返回用户标识
    
    Args:
        token: JWT 令牌字符串
        
    Returns:
        用户标识字符串，如果令牌无效则返回 None
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data: str = payload.get("sub")
        if token_data is None:
            return None
        return token_data
    except JWTError:
        return None


def check_password_strength(password: str) -> dict:
    """
    检查密码强度
    
    Args:
        password: 要检查的密码
        
    Returns:
        包含各种强度检查结果的字典
    """
    return {
        "min_length": len(password) >= 6,
        "has_upper": any(c.isupper() for c in password),
        "has_lower": any(c.islower() for c in password),
        "has_digit": any(c.isdigit() for c in password),
        "has_special": any(not c.isalnum() for c in password)
    }
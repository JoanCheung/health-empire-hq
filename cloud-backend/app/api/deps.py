from typing import Annotated, Optional, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud.crud_user import user_crud
from app.models.user import User
from app.core.security import verify_token

# HTTP Bearer 认证方案 - 用于 JWT 令牌认证
security = HTTPBearer(auto_error=False)

# 类型别名，简化依赖注入
DatabaseDep = Annotated[Session, Depends(get_db)]
SecurityDep = Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)]


def get_current_user(
    db: DatabaseDep,
    credentials: SecurityDep
) -> User:
    """
    获取当前认证用户
    
    Args:
        db: 数据库会话
        credentials: HTTP 认证凭据
        
    Returns:
        当前认证的用户对象
        
    Raises:
        HTTPException: 认证失败时抛出异常
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="缺少认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    user_id_str = verify_token(token)
    
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的用户ID格式",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_obj = user_crud.get_user_by_id(db, user_id=user_id)
    if user_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return user_obj


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    获取当前激活用户
    
    Args:
        current_user: 当前认证用户
        
    Returns:
        激活的用户对象
        
    Raises:
        HTTPException: 用户未激活时抛出异常
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户账户未激活"
        )
    return current_user


# 类型别名，用于控制器中的依赖注入
CurrentUser = Annotated[User, Depends(get_current_user)]
ActiveUser = Annotated[User, Depends(get_current_active_user)]
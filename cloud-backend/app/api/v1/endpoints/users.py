from typing import Any
import math

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.crud_user import user_crud, UserAlreadyExistsError
from app.database import get_db
from app.schemas.user import (
    User as UserSchema,
    UserCreate,
    UserUpdate,
    UserListResponse,
    UserResponse,
    Message
)
from app.core.config import settings

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> UserResponse:
    """
    创建新用户
    
    Args:
        db: 数据库会话
        user_in: 用户创建数据
        
    Returns:
        创建成功的用户信息
        
    Raises:
        HTTPException: 当邮箱或用户名已被使用时抛出异常
    """
    try:
        user = user_crud.create_user(db, user_create=user_in)
        return UserResponse(data=user, message="用户创建成功")
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建用户时发生错误"
        )


@router.get("/", response_model=UserListResponse)
def read_users(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    is_active: bool = Query(None, description="筛选激活状态"),
    search: str = Query(None, description="搜索关键词"),
    order_by: str = Query("created_at", description="排序字段"),
) -> Any:
    """
    获取用户列表（分页、筛选、搜索）
    """
    # 计算跳过的记录数
    skip = (page - 1) * size
    
    # 获取用户列表和总数
    users = user_crud.get_multi(
        db, 
        skip=skip, 
        limit=size, 
        is_active=is_active,
        search=search,
        order_by=order_by
    )
    total = user_crud.get_count(db, is_active=is_active, search=search)
    
    # 计算总页数
    pages = math.ceil(total / size) if total > 0 else 1
    
    return UserListResponse(
        items=users,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    根据 ID 获取用户
    
    Args:
        user_id: 用户ID
        db: 数据库会话
        
    Returns:
        用户信息
        
    Raises:
        HTTPException: 当用户不存在时抛出异常
    """
    user = user_crud.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return UserResponse(data=user, message="获取用户成功")


@router.get("/email/{email}", response_model=UserResponse)
async def read_user_by_email(
    email: str,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    根据邮箱获取用户
    
    Args:
        email: 用户邮箱
        db: 数据库会话
        
    Returns:
        用户信息
        
    Raises:
        HTTPException: 当用户不存在时抛出异常
    """
    user = user_crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return UserResponse(data=user, message="获取用户成功")


@router.get("/username/{username}", response_model=UserResponse)
async def read_user_by_username(
    username: str,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    根据用户名获取用户
    
    Args:
        username: 用户名
        db: 数据库会话
        
    Returns:
        用户信息
        
    Raises:
        HTTPException: 当用户不存在时抛出异常
    """
    user = user_crud.get_user_by_username(db, username=username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return UserResponse(data=user, message="获取用户成功")


# 根据需求，只需要用户创建和读取功能
# 如果需要更多功能，可以在此处添加更新和删除端点
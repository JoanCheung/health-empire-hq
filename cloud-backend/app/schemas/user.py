from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field, field_validator


# 用户基础模式
class UserBase(BaseModel):
    """用户基础数据模式"""
    email: EmailStr = Field(..., description="用户邮箱")
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    full_name: Optional[str] = Field(None, max_length=100, description="用户全名")
    is_active: bool = Field(True, description="用户是否激活")

    @field_validator('username')
    @classmethod
    def username_must_be_alphanumeric(cls, v: str) -> str:
        """验证用户名只能包含字母、数字、下划线和连字符"""
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('用户名只能包含字母、数字、下划线和连字符')
        return v


# 创建用户时的输入模式
class UserCreate(UserBase):
    """创建用户的数据模式"""
    password: str = Field(..., min_length=6, max_length=100, description="用户密码")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        if len(v) < 6:
            raise ValueError('密码至少需要6个字符')
        return v


# 更新用户时的输入模式
class UserUpdate(BaseModel):
    """更新用户的数据模式"""
    email: Optional[EmailStr] = Field(None, description="用户邮箱")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="用户名")
    full_name: Optional[str] = Field(None, max_length=100, description="用户全名")
    password: Optional[str] = Field(None, min_length=6, max_length=100, description="用户密码")
    is_active: Optional[bool] = Field(None, description="用户是否激活")

    @field_validator('username')
    @classmethod
    def username_must_be_alphanumeric(cls, v: Optional[str]) -> Optional[str]:
        """验证用户名格式"""
        if v is not None and not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('用户名只能包含字母、数字、下划线和连字符')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        """验证密码强度"""
        if v is not None and len(v) < 6:
            raise ValueError('密码至少需要6个字符')
        return v


# 数据库中的用户模式（返回给客户端）
class User(UserBase):
    """完整的用户数据模式"""
    id: int = Field(..., description="用户ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    model_config = {"from_attributes": True}


# 用户列表响应模式
class UserListResponse(BaseModel):
    """用户列表响应数据模式"""
    items: List[User] = Field(..., description="用户列表")
    total: int = Field(..., description="总记录数")
    page: int = Field(..., description="当前页码")
    size: int = Field(..., description="页面大小")
    pages: int = Field(..., description="总页数")


# API 响应的通用模式
class Message(BaseModel):
    """通用消息响应模式"""
    message: str = Field(..., description="响应消息")


class UserResponse(BaseModel):
    """用户操作响应模式"""
    data: User = Field(..., description="用户数据")
    message: str = Field("操作成功", description="响应消息")
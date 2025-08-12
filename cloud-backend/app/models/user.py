from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, String, DateTime, UniqueConstraint, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base

if TYPE_CHECKING:
    from app.models.health_record import HealthRecord


class User(Base):
    """
    用户模型 - 使用 SQLAlchemy 2.0+ 现代语法
    
    包含用户基本信息和认证相关字段
    """
    __tablename__ = "users"
    
    # 表级约束
    __table_args__ = (
        # 复合唯一约束（防止相同邮箱和用户名的组合）
        UniqueConstraint('email', 'username', name='uq_user_email_username'),
        
        # 检查约束
        CheckConstraint(
            "LENGTH(username) >= 3 AND LENGTH(username) <= 50", 
            name='ck_username_length'
        ),
        CheckConstraint(
            "LENGTH(email) >= 5 AND LENGTH(email) <= 255", 
            name='ck_email_length'
        ),
        CheckConstraint(
            "LENGTH(hashed_password) >= 10", 
            name='ck_password_hash_length'
        ),
        
        # 性能优化索引
        Index('ix_users_email_active', 'email', 'is_active'),
        Index('ix_users_username_active', 'username', 'is_active'),
        Index('ix_users_created_at', 'created_at'),
        Index('ix_users_full_search', 'email', 'username', 'full_name'),
    )

    # 主键字段
    id: Mapped[int] = mapped_column(
        primary_key=True, 
        index=True, 
        autoincrement=True,
        comment="用户唯一标识符"
    )
    
    # 认证字段
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False,
        comment="用户邮箱地址"
    )
    
    username: Mapped[str] = mapped_column(
        String(50), 
        unique=True, 
        index=True, 
        nullable=False,
        comment="用户名"
    )
    
    hashed_password: Mapped[str] = mapped_column(
        String(255), 
        nullable=False,
        comment="加密后的密码哈希"
    )
    
    # 用户信息字段
    full_name: Mapped[Optional[str]] = mapped_column(
        String(100), 
        nullable=True,
        comment="用户全名"
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        nullable=False, 
        index=True,
        comment="用户是否激活"
    )
    
    # 时间戳字段
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        comment="创建时间"
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False,
        comment="最后更新时间"
    )

    # 关联关系
    health_records: Mapped[list["HealthRecord"]] = relationship(
        "HealthRecord", 
        back_populates="user", 
        cascade="all, delete-orphan",
        lazy="select"
    )

    def __repr__(self) -> str:
        """用户对象的字符串表示"""
        return (
            f"<User(id={self.id}, username='{self.username}', "
            f"email='{self.email}', is_active={self.is_active})>"
        )
    
    def __str__(self) -> str:
        """用户对象的友好字符串表示"""
        return f"{self.full_name or self.username} ({self.email})"
    
    @property
    def display_name(self) -> str:
        """获取显示名称"""
        return self.full_name or self.username
    
    def is_email_verified(self) -> bool:
        """检查邮箱是否已验证（扩展功能占位）"""
        # 这里可以扩展邮箱验证功能
        return self.is_active
    
    def get_profile_summary(self) -> dict:
        """获取用户资料摘要"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "display_name": self.display_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
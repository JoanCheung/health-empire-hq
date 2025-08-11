from typing import Any, Dict, Optional, Union, List, Sequence
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

# 配置日志
logger = logging.getLogger(__name__)


class UserNotFoundError(Exception):
    """用户不存在异常"""
    pass


class UserAlreadyExistsError(Exception):
    """用户已存在异常"""
    pass


class CRUDUser:
    """
    用户 CRUD 操作类 - 使用 SQLAlchemy 2.0+ 现代语法
    
    提供完整的用户数据管理功能，包括创建、读取、更新、删除操作
    """
    
    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """
        根据 ID 获取用户
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            
        Returns:
            用户对象或 None
        """
        try:
            stmt = select(User).where(User.id == user_id)
            result = db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"根据ID获取用户失败 (ID: {user_id}): {e}")
            return None

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """
        根据邮箱获取用户
        
        Args:
            db: 数据库会话
            email: 用户邮箱
            
        Returns:
            用户对象或 None
        """
        try:
            stmt = select(User).where(User.email == email)
            result = db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"根据邮箱获取用户失败 (email: {email}): {e}")
            return None

    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """
        根据用户名获取用户
        
        Args:
            db: 数据库会话
            username: 用户名
            
        Returns:
            用户对象或 None
        """
        try:
            stmt = select(User).where(User.username == username)
            result = db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"根据用户名获取用户失败 (username: {username}): {e}")
            return None

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        order_by: str = "created_at"
    ) -> List[User]:
        """
        获取用户列表（支持分页、筛选、搜索）
        
        Args:
            db: 数据库会话
            skip: 跳过记录数
            limit: 限制返回数量
            is_active: 筛选激活状态
            search: 搜索关键词（在用户名、邮箱、全名中搜索）
            order_by: 排序字段
            
        Returns:
            用户列表
        """
        try:
            stmt = select(User)
            
            # 添加筛选条件
            conditions = []
            if is_active is not None:
                conditions.append(User.is_active == is_active)
            
            if search:
                search_pattern = f"%{search}%"
                search_conditions = or_(
                    User.username.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    User.full_name.ilike(search_pattern)
                )
                conditions.append(search_conditions)
            
            if conditions:
                stmt = stmt.where(and_(*conditions))
            
            # 添加排序
            if order_by == "created_at":
                stmt = stmt.order_by(desc(User.created_at))
            elif order_by == "username":
                stmt = stmt.order_by(User.username)
            elif order_by == "email":
                stmt = stmt.order_by(User.email)
            
            # 添加分页
            stmt = stmt.offset(skip).limit(limit)
            
            result = db.execute(stmt)
            return list(result.scalars().all())
            
        except SQLAlchemyError as e:
            logger.error(f"获取用户列表失败: {e}")
            return []

    def get_count(
        self, 
        db: Session,
        *,
        is_active: Optional[bool] = None,
        search: Optional[str] = None
    ) -> int:
        """
        获取用户总数
        
        Args:
            db: 数据库会话
            is_active: 筛选激活状态
            search: 搜索关键词
            
        Returns:
            用户总数
        """
        try:
            stmt = select(func.count(User.id))
            
            # 添加筛选条件
            conditions = []
            if is_active is not None:
                conditions.append(User.is_active == is_active)
            
            if search:
                search_pattern = f"%{search}%"
                search_conditions = or_(
                    User.username.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    User.full_name.ilike(search_pattern)
                )
                conditions.append(search_conditions)
            
            if conditions:
                stmt = stmt.where(and_(*conditions))
            
            result = db.execute(stmt)
            return result.scalar() or 0
            
        except SQLAlchemyError as e:
            logger.error(f"获取用户总数失败: {e}")
            return 0

    def create_user(self, db: Session, user_create: UserCreate) -> User:
        """
        创建用户
        
        Args:
            db: 数据库会话
            user_create: 用户创建数据
            
        Returns:
            新创建的用户对象
            
        Raises:
            UserAlreadyExistsError: 邮箱或用户名已存在
        """
        try:
            # 检查邮箱是否已存在
            if self.is_email_taken(db, email=user_create.email):
                raise UserAlreadyExistsError(f"邮箱 {user_create.email} 已存在")
            
            # 检查用户名是否已存在
            if self.is_username_taken(db, username=user_create.username):
                raise UserAlreadyExistsError(f"用户名 {user_create.username} 已存在")
            
            # 创建用户对象
            db_user = User(
                email=user_create.email,
                username=user_create.username,
                hashed_password=get_password_hash(user_create.password),
                full_name=user_create.full_name,
                is_active=user_create.is_active,
            )
            
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            logger.info(f"成功创建用户: {db_user.username} ({db_user.email})")
            return db_user
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"创建用户时数据库完整性错误: {e}")
            raise UserAlreadyExistsError("邮箱或用户名已存在")
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"创建用户失败: {e}")
            raise

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """
        更新用户信息
        
        Args:
            db: 数据库会话
            db_obj: 现有用户对象
            obj_in: 更新数据
            
        Returns:
            更新后的用户对象
        """
        try:
            if isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = obj_in.model_dump(exclude_unset=True)
            
            # 处理密码更新
            if "password" in update_data:
                hashed_password = get_password_hash(update_data["password"])
                del update_data["password"]
                update_data["hashed_password"] = hashed_password

            # 应用更新
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)

            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            
            logger.info(f"成功更新用户: {db_obj.username}")
            return db_obj
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"更新用户失败 (ID: {db_obj.id}): {e}")
            raise

    def remove(self, db: Session, user_id: int) -> User:
        """
        删除用户
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            
        Returns:
            被删除的用户对象
            
        Raises:
            UserNotFoundError: 用户不存在
        """
        try:
            stmt = select(User).where(User.id == user_id)
            result = db.execute(stmt)
            db_obj = result.scalar_one_or_none()
            
            if not db_obj:
                raise UserNotFoundError(f"用户不存在 (ID: {user_id})")
            
            db.delete(db_obj)
            db.commit()
            
            logger.info(f"成功删除用户: {db_obj.username} (ID: {user_id})")
            return db_obj
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"删除用户失败 (ID: {user_id}): {e}")
            raise

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        用户认证
        
        Args:
            db: 数据库会话
            email: 用户邮箱
            password: 原始密码
            
        Returns:
            认证成功返回用户对象，失败返回 None
        """
        try:
            user = self.get_user_by_email(db, email=email)
            if not user:
                logger.warning(f"认证失败：用户不存在 (email: {email})")
                return None
            
            if not verify_password(password, user.hashed_password):
                logger.warning(f"认证失败：密码错误 (email: {email})")
                return None
            
            if not user.is_active:
                logger.warning(f"认证失败：用户未激活 (email: {email})")
                return None
            
            logger.info(f"用户认证成功: {user.username}")
            return user
            
        except SQLAlchemyError as e:
            logger.error(f"用户认证时数据库错误 (email: {email}): {e}")
            return None

    def is_active(self, user: User) -> bool:
        """检查用户是否激活"""
        return user.is_active

    def is_email_taken(
        self, 
        db: Session, 
        email: str, 
        exclude_id: Optional[int] = None
    ) -> bool:
        """
        检查邮箱是否已被使用
        
        Args:
            db: 数据库会话
            email: 邮箱地址
            exclude_id: 排除的用户ID（用于更新时检查）
            
        Returns:
            邮箱是否已被使用
        """
        try:
            stmt = select(User.id).where(User.email == email)
            if exclude_id:
                stmt = stmt.where(User.id != exclude_id)
            
            result = db.execute(stmt)
            return result.scalar_one_or_none() is not None
            
        except SQLAlchemyError as e:
            logger.error(f"检查邮箱是否已被使用失败 (email: {email}): {e}")
            return True  # 发生错误时保守返回 True

    def is_username_taken(
        self, 
        db: Session, 
        username: str, 
        exclude_id: Optional[int] = None
    ) -> bool:
        """
        检查用户名是否已被使用
        
        Args:
            db: 数据库会话
            username: 用户名
            exclude_id: 排除的用户ID（用于更新时检查）
            
        Returns:
            用户名是否已被使用
        """
        try:
            stmt = select(User.id).where(User.username == username)
            if exclude_id:
                stmt = stmt.where(User.id != exclude_id)
            
            result = db.execute(stmt)
            return result.scalar_one_or_none() is not None
            
        except SQLAlchemyError as e:
            logger.error(f"检查用户名是否已被使用失败 (username: {username}): {e}")
            return True  # 发生错误时保守返回 True

    def activate_user(self, db: Session, user_id: int) -> Optional[User]:
        """激活用户"""
        try:
            stmt = select(User).where(User.id == user_id)
            result = db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                return None
            
            user.is_active = True
            db.commit()
            db.refresh(user)
            
            logger.info(f"用户已激活: {user.username}")
            return user
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"激活用户失败 (ID: {user_id}): {e}")
            raise

    def deactivate_user(self, db: Session, user_id: int) -> Optional[User]:
        """停用用户"""
        try:
            stmt = select(User).where(User.id == user_id)
            result = db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                return None
            
            user.is_active = False
            db.commit()
            db.refresh(user)
            
            logger.info(f"用户已停用: {user.username}")
            return user
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"停用用户失败 (ID: {user_id}): {e}")
            raise


# 创建实例
user_crud = CRUDUser()

# 向后兼容的别名
user = user_crud
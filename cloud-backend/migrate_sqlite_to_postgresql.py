#!/usr/bin/env python3
"""
SQLite 到 PostgreSQL 数据迁移脚本
用于将现有的 SQLite 用户数据迁移到新的 PostgreSQL 数据库

使用方法:
    python migrate_sqlite_to_postgresql.py
    
注意: 在运行此脚本之前，请确保:
1. SQLite 数据库文件存在 (users.db)
2. PostgreSQL 数据库连接正常
3. 已经安装了所有依赖项
"""

import sys
import os
from pathlib import Path
from typing import List, Dict, Any
import logging

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.database import Base
from app.core.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DatabaseMigrator:
    """数据库迁移器"""
    
    def __init__(self):
        self.sqlite_db_path = "users.db"
        self.sqlite_url = f"sqlite:///./{self.sqlite_db_path}"
        self.postgresql_url = settings.DATABASE_URL
        
        # 创建数据库连接
        self.sqlite_engine = None
        self.postgresql_engine = None
        
    def setup_connections(self) -> bool:
        """设置数据库连接"""
        try:
            # SQLite 连接
            if os.path.exists(self.sqlite_db_path):
                self.sqlite_engine = create_engine(
                    self.sqlite_url,
                    connect_args={"check_same_thread": False}
                )
                logger.info(f"✅ SQLite 连接成功: {self.sqlite_db_path}")
            else:
                logger.warning(f"⚠️  SQLite 数据库文件不存在: {self.sqlite_db_path}")
                return False
            
            # PostgreSQL 连接
            self.postgresql_engine = create_engine(self.postgresql_url)
            logger.info("✅ PostgreSQL 连接成功")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ 数据库连接失败: {e}")
            return False
    
    def verify_sqlite_data(self) -> int:
        """验证 SQLite 数据"""
        try:
            with self.sqlite_engine.connect() as conn:
                result = conn.execute(text("SELECT COUNT(*) FROM users"))
                count = result.scalar()
                logger.info(f"📊 SQLite 数据库中有 {count} 个用户")
                return count
        except Exception as e:
            logger.error(f"❌ 读取 SQLite 数据失败: {e}")
            return 0
    
    def extract_sqlite_users(self) -> List[Dict[str, Any]]:
        """从 SQLite 提取用户数据"""
        users_data = []
        try:
            with self.sqlite_engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT id, email, username, hashed_password, full_name, 
                           is_active, created_at, updated_at
                    FROM users
                    ORDER BY id
                """))
                
                for row in result:
                    user_data = {
                        'id': row.id,
                        'email': row.email,
                        'username': row.username,
                        'hashed_password': row.hashed_password,
                        'full_name': row.full_name,
                        'is_active': bool(row.is_active),
                        'created_at': row.created_at,
                        'updated_at': row.updated_at
                    }
                    users_data.append(user_data)
                
                logger.info(f"✅ 成功提取 {len(users_data)} 个用户数据")
                return users_data
                
        except Exception as e:
            logger.error(f"❌ 提取 SQLite 数据失败: {e}")
            return []
    
    def setup_postgresql_tables(self):
        """设置 PostgreSQL 表结构"""
        try:
            # 创建所有表
            Base.metadata.create_all(bind=self.postgresql_engine)
            logger.info("✅ PostgreSQL 表结构创建成功")
        except Exception as e:
            logger.error(f"❌ 创建 PostgreSQL 表结构失败: {e}")
            raise
    
    def insert_users_to_postgresql(self, users_data: List[Dict[str, Any]]) -> bool:
        """将用户数据插入到 PostgreSQL"""
        try:
            SessionLocal = sessionmaker(bind=self.postgresql_engine)
            session = SessionLocal()
            
            success_count = 0
            error_count = 0
            
            for user_data in users_data:
                try:
                    # 检查用户是否已存在
                    existing_user = session.query(User).filter(
                        (User.email == user_data['email']) | 
                        (User.username == user_data['username'])
                    ).first()
                    
                    if existing_user:
                        logger.warning(f"⚠️  用户已存在，跳过: {user_data['username']} ({user_data['email']})")
                        continue
                    
                    # 创建新用户对象
                    new_user = User(
                        email=user_data['email'],
                        username=user_data['username'],
                        hashed_password=user_data['hashed_password'],
                        full_name=user_data['full_name'],
                        is_active=user_data['is_active'],
                        created_at=user_data['created_at'],
                        updated_at=user_data['updated_at']
                    )
                    
                    session.add(new_user)
                    session.commit()
                    success_count += 1
                    logger.info(f"✅ 迁移用户成功: {user_data['username']}")
                    
                except Exception as e:
                    session.rollback()
                    error_count += 1
                    logger.error(f"❌ 迁移用户失败 {user_data['username']}: {e}")
            
            session.close()
            
            logger.info(f"📊 迁移完成: 成功 {success_count} 个, 失败 {error_count} 个")
            return error_count == 0
            
        except Exception as e:
            logger.error(f"❌ 批量插入数据失败: {e}")
            return False
    
    def verify_migration(self) -> bool:
        """验证迁移结果"""
        try:
            with self.postgresql_engine.connect() as conn:
                result = conn.execute(text("SELECT COUNT(*) FROM users"))
                postgresql_count = result.scalar()
                
            sqlite_count = self.verify_sqlite_data()
            
            logger.info(f"📊 迁移验证:")
            logger.info(f"   SQLite 用户数: {sqlite_count}")
            logger.info(f"   PostgreSQL 用户数: {postgresql_count}")
            
            if postgresql_count >= sqlite_count:
                logger.info("✅ 数据迁移验证成功!")
                return True
            else:
                logger.warning("⚠️  数据迁移可能不完整")
                return False
                
        except Exception as e:
            logger.error(f"❌ 迁移验证失败: {e}")
            return False
    
    def run_migration(self) -> bool:
        """执行完整的迁移流程"""
        logger.info("🚀 开始数据库迁移...")
        
        # 1. 设置连接
        if not self.setup_connections():
            return False
        
        # 2. 验证源数据
        sqlite_count = self.verify_sqlite_data()
        if sqlite_count == 0:
            logger.warning("⚠️  没有需要迁移的数据")
            return True
        
        # 3. 提取 SQLite 数据
        users_data = self.extract_sqlite_users()
        if not users_data:
            logger.error("❌ 无法提取 SQLite 数据")
            return False
        
        # 4. 设置 PostgreSQL 表
        self.setup_postgresql_tables()
        
        # 5. 插入数据到 PostgreSQL
        if not self.insert_users_to_postgresql(users_data):
            logger.error("❌ 数据插入失败")
            return False
        
        # 6. 验证迁移结果
        if not self.verify_migration():
            logger.warning("⚠️  迁移验证未通过")
            return False
        
        logger.info("🎉 数据库迁移完成!")
        return True


def main():
    """主函数"""
    print("SQLite 到 PostgreSQL 数据迁移工具")
    print("=" * 50)
    
    # 确认迁移
    response = input("是否要开始迁移? (y/N): ").lower().strip()
    if response not in ['y', 'yes']:
        print("迁移已取消")
        return
    
    # 执行迁移
    migrator = DatabaseMigrator()
    success = migrator.run_migration()
    
    if success:
        print("\n✅ 迁移成功完成!")
        print("\n📝 后续步骤:")
        print("1. 验证应用程序功能正常")
        print("2. 备份原始 SQLite 文件")
        print("3. 更新生产环境配置")
    else:
        print("\n❌ 迁移失败，请检查日志并重试")
        sys.exit(1)


if __name__ == "__main__":
    main()
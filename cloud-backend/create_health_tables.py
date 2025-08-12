#!/usr/bin/env python3
"""
健康记录表创建脚本
用于在现有数据库中创建 health_records 表

使用方法:
    python create_health_tables.py
"""

import sys
from pathlib import Path
import logging
from datetime import datetime

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.database import engine, Base, check_database_connection
from app.models.user import User
from app.models.health_record import HealthRecord
from sqlalchemy import inspect, text

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_table_exists(table_name: str) -> bool:
    """检查表是否存在"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def create_health_tables():
    """创建健康记录表"""
    logger.info("🚀 开始创建健康记录表...")
    
    # 检查数据库连接
    if not check_database_connection():
        logger.error("❌ 数据库连接失败")
        return False
    
    try:
        # 检查表是否已存在
        if check_table_exists("health_records"):
            logger.warning("⚠️ health_records 表已存在，跳过创建")
            return True
        
        # 创建表
        logger.info("📋 创建 health_records 表...")
        Base.metadata.create_all(bind=engine, tables=[HealthRecord.__table__])
        
        # 验证表创建
        if check_table_exists("health_records"):
            logger.info("✅ health_records 表创建成功")
            
            # 显示表结构
            inspector = inspect(engine)
            columns = inspector.get_columns("health_records")
            logger.info(f"📊 表结构: {len(columns)} 列")
            
            for col in columns:
                logger.info(f"  - {col['name']}: {col['type']}")
            
            return True
        else:
            logger.error("❌ 表创建验证失败")
            return False
            
    except Exception as e:
        logger.error(f"❌ 创建表时发生错误: {e}")
        return False


def create_sample_data():
    """创建示例数据"""
    logger.info("📝 创建示例健康记录...")
    
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # 获取第一个用户
        user = db.query(User).first()
        if not user:
            logger.warning("⚠️ 没有找到用户，跳过示例数据创建")
            return True
        
        # 检查是否已有健康记录
        existing_records = db.query(HealthRecord).filter(HealthRecord.user_id == user.id).count()
        if existing_records > 0:
            logger.info(f"ℹ️ 用户 {user.username} 已有 {existing_records} 条健康记录")
            return True
        
        # 创建示例记录
        sample_records = [
            HealthRecord.create_sample_record(user.id, 85.0, "comprehensive"),
            HealthRecord.create_sample_record(user.id, 78.5, "quick"),
            HealthRecord.create_sample_record(user.id, 92.0, "comprehensive"),
        ]
        
        for record in sample_records:
            db.add(record)
        
        db.commit()
        logger.info(f"✅ 为用户 {user.username} 创建了 {len(sample_records)} 条示例健康记录")
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ 创建示例数据时发生错误: {e}")
        return False
    finally:
        db.close()


def main():
    """主函数"""
    print("Health Empire HQ - 健康记录表创建工具")
    print("=" * 50)
    
    # 创建表
    if not create_health_tables():
        print("❌ 表创建失败")
        sys.exit(1)
    
    # 询问是否创建示例数据
    try:
        response = input("\n是否创建示例健康记录数据? (y/N): ").lower().strip()
        if response in ['y', 'yes']:
            create_sample_data()
    except KeyboardInterrupt:
        print("\n⚠️ 操作被用户取消")
    
    print("\n🎉 健康记录表设置完成!")
    print("\n📝 接下来您可以:")
    print("1. 启动应用: python run.py")
    print("2. 访问 API 文档: http://localhost:8000/docs")
    print("3. 测试健康趋势 API: GET /api/v1/users/{user_id}/health-trends")


if __name__ == "__main__":
    main()
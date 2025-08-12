from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# 现代 SQLAlchemy 2.0+ 基础模型类
class Base(DeclarativeBase):
    """SQLAlchemy 2.0+ 基础模型类"""
    pass




# 创建 PostgreSQL 引擎 - 使用连接池配置
engine = create_engine(
    settings.DATABASE_URL,
    # PostgreSQL 连接池配置
    pool_size=10,  # 连接池大小
    max_overflow=20,  # 最大溢出连接数
    pool_pre_ping=True,  # 连接前验证连接有效性
    pool_recycle=3600,  # 1小时回收连接
    pool_timeout=30,  # 连接池获取连接超时时间
    # 性能配置
    echo=False,  # 生产环境关闭 SQL 日志
    echo_pool=False,  # 关闭连接池日志
    future=True,  # 启用 SQLAlchemy 2.0 风格
)



# 创建会话工厂 - 使用现代配置
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # 避免会话提交后对象失效
)


# 数据库会话依赖注入
def get_db() -> Generator[sessionmaker, None, None]:
    """
    获取数据库会话依赖注入
    
    使用生成器模式确保会话正确关闭
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"数据库会话错误: {e}")
        db.rollback()
        raise
    finally:
        db.close()


# 创建所有表
def create_tables() -> None:
    """创建所有数据库表"""
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
        logger.info("数据库表检查/创建完成")
    except Exception as e:
        logger.error(f"创建数据库表失败: {e}")
        # 如果是索引已存在的错误，忽略继续执行
        if "already exists" in str(e):
            logger.info("某些索引已存在，忽略错误继续执行")
        else:
            raise


# 数据库健康检查
def check_database_connection() -> bool:
    """检查数据库连接状态"""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("数据库连接正常")
        return True
    except Exception as e:
        logger.error(f"数据库连接检查失败: {e}")
        return False


# 数据库维护操作
def optimize_database() -> None:
    """执行数据库优化操作"""
    try:
        with engine.connect() as connection:
            # PostgreSQL 优化 - 分析表统计信息
            connection.execute(text("ANALYZE"))
            connection.commit()
        logger.info("数据库优化完成")
    except Exception as e:
        logger.error(f"数据库优化失败: {e}")
        raise
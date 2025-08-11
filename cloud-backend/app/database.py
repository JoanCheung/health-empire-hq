from typing import Generator
from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import StaticPool
from app.core.config import settings
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# 现代 SQLAlchemy 2.0+ 基础模型类
class Base(DeclarativeBase):
    """SQLAlchemy 2.0+ 基础模型类"""
    pass


# SQLite 优化配置
def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    """启用 SQLite 外键约束"""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    # 设置 WAL 模式以提高并发性能
    cursor.execute("PRAGMA journal_mode=WAL")
    # 设置同步模式为 NORMAL 以平衡性能和安全性
    cursor.execute("PRAGMA synchronous=NORMAL")
    # 设置缓存大小 (8MB)
    cursor.execute("PRAGMA cache_size=-8000")
    # 设置临时存储为内存
    cursor.execute("PRAGMA temp_store=MEMORY")
    # 启用查询优化器分析
    cursor.execute("PRAGMA optimize")
    cursor.close()


# 创建 SQLite 引擎 - 使用连接池配置
engine = create_engine(
    settings.SQLITE_URL,
    # SQLite 特定配置
    connect_args={
        "check_same_thread": False,  # 允许多线程
        "timeout": 20  # 连接超时设置
    },
    # 连接池配置
    poolclass=StaticPool,  # SQLite 推荐使用静态连接池
    pool_pre_ping=True,  # 连接前验证连接有效性
    pool_recycle=3600,  # 1小时回收连接
    # 性能配置
    echo=False,  # 生产环境关闭 SQL 日志
    echo_pool=False,  # 关闭连接池日志
    future=True,  # 启用 SQLAlchemy 2.0 风格
)

# 注册 SQLite 优化事件监听器
event.listen(engine, "connect", _enable_sqlite_foreign_keys)


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
        Base.metadata.create_all(bind=engine)
        logger.info("数据库表创建成功")
    except Exception as e:
        logger.error(f"创建数据库表失败: {e}")
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
            # SQLite 优化
            connection.execute(text("PRAGMA optimize"))
            connection.execute(text("VACUUM"))
            connection.commit()
        logger.info("数据库优化完成")
    except Exception as e:
        logger.error(f"数据库优化失败: {e}")
        raise
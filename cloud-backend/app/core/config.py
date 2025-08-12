from typing import Union, List
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置设置"""
    
    # 项目基础设置
    PROJECT_NAME: str = "User Management API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # 服务器设置
    SERVER_HOST: str = "localhost"
    SERVER_PORT: int = 8000
    
    # 数据库设置
    DATABASE_URL: str = "postgresql://healthuser:healthpass123@localhost:5432/healthdb"
    
    @property
    def database_url(self) -> str:
        """获取数据库 URL"""
        return self.DATABASE_URL
    
    # 安全设置
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS 设置
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """组装 CORS 源列表"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # 分页设置
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }


settings = Settings()
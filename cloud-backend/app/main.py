from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict

from app.api.v1.api import api_router
from app.core.config import settings
from app.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    create_tables()
    print(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION} 启动成功!")
    print(f"📚 API 文档地址: http://{settings.SERVER_HOST}:{settings.SERVER_PORT}/docs")
    print(f"🔧 ReDoc 文档地址: http://{settings.SERVER_HOST}:{settings.SERVER_PORT}/redoc")
    
    yield
    
    # 关闭时执行
    print("应用正在关闭...")


# 创建 FastAPI 应用实例
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="用户管理 API - 提供完整的用户 CRUD 功能",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# 配置 CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# 包含 API 路由
app.include_router(api_router, prefix=settings.API_V1_STR)


# 根路径
@app.get("/", response_class=JSONResponse)
async def root() -> Dict[str, str]:
    """根路径 - 返回 API 基本信息"""
    return {
        "message": f"欢迎使用 {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "api_prefix": settings.API_V1_STR
    }


# 健康检查端点
@app.get("/health", response_class=JSONResponse)
async def health_check() -> Dict[str, str]:
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


# 如果直接运行此文件，启动开发服务器
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=True,
        log_level="info"
    )
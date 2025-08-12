from fastapi import APIRouter

from app.api.v1.endpoints import users, health_trends

api_router = APIRouter()

# 包含用户相关路由（前缀和标签已在 users.router 中定义）
api_router.include_router(users.router)

# 包含健康趋势相关路由
api_router.include_router(
    health_trends.router, 
    prefix="/users", 
    tags=["health-trends"]
)
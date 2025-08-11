from fastapi import APIRouter

from app.api.v1.endpoints import users

api_router = APIRouter()

# 包含用户相关路由（前缀和标签已在 users.router 中定义）
api_router.include_router(users.router)
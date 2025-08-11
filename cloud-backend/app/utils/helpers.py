from typing import Dict, Any
import re


def validate_email_format(email: str) -> bool:
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def sanitize_username(username: str) -> str:
    """清理用户名，移除不允许的字符"""
    # 只保留字母、数字、下划线和连字符
    return re.sub(r'[^a-zA-Z0-9_-]', '', username)


def format_api_response(data: Any = None, message: str = "操作成功", success: bool = True) -> Dict[str, Any]:
    """格式化 API 响应"""
    response = {
        "success": success,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return response


def calculate_pagination_info(total: int, page: int, size: int) -> Dict[str, Any]:
    """计算分页信息"""
    import math
    
    pages = math.ceil(total / size) if total > 0 else 1
    has_next = page < pages
    has_prev = page > 1
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
        "has_next": has_next,
        "has_prev": has_prev
    }
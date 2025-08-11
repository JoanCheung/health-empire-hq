#!/usr/bin/env python3
"""
用户管理 API 启动脚本
支持开发和生产环境配置
"""

import argparse
import sys
from pathlib import Path

import uvicorn

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.config import settings


def main() -> None:
    """主函数 - 解析命令行参数并启动服务器"""
    parser = argparse.ArgumentParser(description="启动 FastAPI 用户管理服务")
    parser.add_argument(
        "--host",
        default=settings.SERVER_HOST,
        help=f"服务器主机地址 (默认: {settings.SERVER_HOST})"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=settings.SERVER_PORT,
        help=f"服务器端口 (默认: {settings.SERVER_PORT})"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=True,
        help="启用热重载（开发模式）"
    )
    parser.add_argument(
        "--no-reload",
        dest="reload",
        action="store_false",
        help="禁用热重载（生产模式）"
    )
    parser.add_argument(
        "--log-level",
        choices=["debug", "info", "warning", "error", "critical"],
        default="info",
        help="日志级别 (默认: info)"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="工作进程数量 (生产环境建议设置为 CPU 核心数)"
    )

    args = parser.parse_args()

    print(f"🚀 启动 {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"📚 API 文档: http://{args.host}:{args.port}/docs")
    print(f"🔧 ReDoc 文档: http://{args.host}:{args.port}/redoc")
    
    # 启动配置
    uvicorn_config = {
        "app": "app.main:app",
        "host": args.host,
        "port": args.port,
        "log_level": args.log_level,
        "access_log": True,
    }
    
    if args.reload:
        print("🔥 开发模式：启用热重载")
        uvicorn_config["reload"] = True
        uvicorn_config["reload_dirs"] = [str(project_root / "app")]
    else:
        print("🏭 生产模式：禁用热重载")
        if args.workers > 1:
            uvicorn_config["workers"] = args.workers
            print(f"👥 工作进程数: {args.workers}")

    uvicorn.run(**uvicorn_config)


if __name__ == "__main__":
    main()
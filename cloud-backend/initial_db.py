#!/usr/bin/env python3
"""
数据库初始化脚本 - 创建云端 PostgreSQL 表结构
作者: Database Administrator
用途: 连接云端 PostgreSQL 并根据 app/models/ 定义创建所有表

使用方法:
    python initial_db.py
"""

import sys
import os
from pathlib import Path
import logging
from datetime import datetime
from typing import Dict, Any

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 导入应用模块
from app.database import engine, Base, check_database_connection, optimize_database
from app.core.config import settings
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError

# 确保日志目录存在
log_dir = project_root / "logs"
log_dir.mkdir(exist_ok=True)

# 配置日志记录
log_file = log_dir / f"db_init_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class DatabaseInitializer:
    """数据库初始化器 - 企业级数据库管理"""
    
    def __init__(self):
        self.engine = engine
        self.success_count = 0
        self.error_count = 0
        self.operations_log = []
        
    def log_operation(self, operation: str, status: str, details: str = ""):
        """记录操作日志"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "operation": operation,
            "status": status,
            "details": details
        }
        self.operations_log.append(log_entry)
        
        if status == "success":
            self.success_count += 1
            logger.info(f"✅ {operation}: {details}")
        else:
            self.error_count += 1
            logger.error(f"❌ {operation}: {details}")
    
    def validate_configuration(self) -> bool:
        """验证数据库配置"""
        logger.info("🔍 验证数据库配置...")
        
        try:
            # 检查必要的配置项
            if not settings.DATABASE_URL:
                self.log_operation("配置验证", "error", "数据库 URL 未配置")
                return False
            
            # 隐藏敏感信息的 URL 显示
            safe_url = settings.DATABASE_URL.split('@')[0].split('//')[0] + "://***@" + settings.DATABASE_URL.split('@')[1]
            self.log_operation("配置验证", "success", f"数据库配置有效: {safe_url}")
            
            # 检查数据库类型
            if not settings.DATABASE_URL.startswith("postgresql://"):
                self.log_operation("配置验证", "error", "数据库类型必须为 PostgreSQL")
                return False
            
            self.log_operation("配置验证", "success", "PostgreSQL 配置验证通过")
            return True
            
        except Exception as e:
            self.log_operation("配置验证", "error", f"配置验证异常: {e}")
            return False
    
    def test_database_connection(self) -> bool:
        """测试数据库连接"""
        logger.info("🔌 测试数据库连接...")
        
        try:
            # 使用应用的连接检查函数
            if check_database_connection():
                self.log_operation("连接测试", "success", "数据库连接正常")
                
                # 获取数据库信息
                with self.engine.connect() as conn:
                    # 获取 PostgreSQL 版本
                    version_result = conn.execute(text("SELECT version()"))
                    version = version_result.scalar()
                    self.log_operation("数据库信息", "success", f"PostgreSQL 版本: {version[:50]}...")
                    
                    # 获取当前数据库名
                    db_result = conn.execute(text("SELECT current_database()"))
                    db_name = db_result.scalar()
                    self.log_operation("数据库信息", "success", f"当前数据库: {db_name}")
                    
                    # 获取当前用户
                    user_result = conn.execute(text("SELECT current_user"))
                    user_name = user_result.scalar()
                    self.log_operation("数据库信息", "success", f"当前用户: {user_name}")
                    
                return True
            else:
                self.log_operation("连接测试", "error", "数据库连接失败")
                return False
                
        except Exception as e:
            self.log_operation("连接测试", "error", f"连接测试异常: {e}")
            return False
    
    def check_existing_tables(self) -> Dict[str, Any]:
        """检查现有表结构"""
        logger.info("📋 检查现有表结构...")
        
        try:
            inspector = inspect(self.engine)
            existing_tables = inspector.get_table_names()
            
            table_info = {
                "existing_tables": existing_tables,
                "table_count": len(existing_tables),
                "details": {}
            }
            
            for table_name in existing_tables:
                columns = inspector.get_columns(table_name)
                indexes = inspector.get_indexes(table_name)
                table_info["details"][table_name] = {
                    "columns": len(columns),
                    "indexes": len(indexes)
                }
                self.log_operation("表检查", "success", 
                                 f"表 '{table_name}': {len(columns)} 列, {len(indexes)} 索引")
            
            if existing_tables:
                self.log_operation("表检查", "success", f"发现 {len(existing_tables)} 个现有表")
            else:
                self.log_operation("表检查", "success", "数据库为空，准备创建新表")
            
            return table_info
            
        except Exception as e:
            self.log_operation("表检查", "error", f"表检查异常: {e}")
            return {"existing_tables": [], "table_count": 0, "details": {}}
    
    def create_database_tables(self) -> bool:
        """创建数据库表结构"""
        logger.info("🏗️ 创建数据库表结构...")
        
        try:
            # 导入所有模型以确保它们被注册
            from app.models.user import User
            
            # 记录即将创建的表
            tables_to_create = []
            for table_name, table in Base.metadata.tables.items():
                tables_to_create.append(table_name)
                self.log_operation("表规划", "success", f"计划创建表: {table_name}")
            
            # 创建所有表
            Base.metadata.create_all(bind=self.engine)
            
            # 验证表创建结果
            inspector = inspect(self.engine)
            created_tables = inspector.get_table_names()
            
            for table_name in tables_to_create:
                if table_name in created_tables:
                    # 获取表详细信息
                    columns = inspector.get_columns(table_name)
                    indexes = inspector.get_indexes(table_name)
                    constraints = inspector.get_check_constraints(table_name)
                    
                    self.log_operation("表创建", "success", 
                                     f"表 '{table_name}' 创建成功: {len(columns)} 列, "
                                     f"{len(indexes)} 索引, {len(constraints)} 约束")
                else:
                    self.log_operation("表创建", "error", f"表 '{table_name}' 创建失败")
            
            self.log_operation("表创建", "success", f"成功创建 {len(created_tables)} 个表")
            return True
            
        except SQLAlchemyError as e:
            self.log_operation("表创建", "error", f"SQLAlchemy 错误: {e}")
            return False
        except Exception as e:
            self.log_operation("表创建", "error", f"表创建异常: {e}")
            return False
    
    def optimize_database_performance(self) -> bool:
        """优化数据库性能"""
        logger.info("⚡ 执行数据库性能优化...")
        
        try:
            # 使用应用的优化函数
            optimize_database()
            self.log_operation("性能优化", "success", "数据库统计信息已更新")
            
            # 执行额外的优化操作
            with self.engine.connect() as conn:
                # 更新表统计信息
                conn.execute(text("ANALYZE"))
                conn.commit()
                self.log_operation("性能优化", "success", "表统计信息已分析")
                
                # 检查数据库大小
                size_result = conn.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database()))
                """))
                db_size = size_result.scalar()
                self.log_operation("数据库信息", "success", f"数据库大小: {db_size}")
                
                # 检查连接数
                conn_result = conn.execute(text("""
                    SELECT count(*) FROM pg_stat_activity 
                    WHERE datname = current_database()
                """))
                conn_count = conn_result.scalar()
                self.log_operation("数据库信息", "success", f"当前连接数: {conn_count}")
            
            return True
            
        except Exception as e:
            self.log_operation("性能优化", "error", f"性能优化异常: {e}")
            return False
    
    def verify_table_structure(self) -> bool:
        """验证表结构完整性"""
        logger.info("🔍 验证表结构完整性...")
        
        try:
            inspector = inspect(self.engine)
            
            # 验证用户表
            if "users" in inspector.get_table_names():
                columns = inspector.get_columns("users")
                column_names = [col['name'] for col in columns]
                
                # 检查必要的列
                required_columns = ['id', 'email', 'username', 'hashed_password', 
                                  'full_name', 'is_active', 'created_at', 'updated_at']
                
                missing_columns = [col for col in required_columns if col not in column_names]
                if missing_columns:
                    self.log_operation("结构验证", "error", f"用户表缺少列: {missing_columns}")
                    return False
                
                self.log_operation("结构验证", "success", f"用户表结构完整: {len(column_names)} 列")
                
                # 检查索引
                indexes = inspector.get_indexes("users")
                self.log_operation("结构验证", "success", f"用户表索引: {len(indexes)} 个")
                
                # 检查约束
                constraints = inspector.get_check_constraints("users")
                self.log_operation("结构验证", "success", f"用户表约束: {len(constraints)} 个")
                
            else:
                self.log_operation("结构验证", "error", "用户表未找到")
                return False
            
            return True
            
        except Exception as e:
            self.log_operation("结构验证", "error", f"结构验证异常: {e}")
            return False
    
    def generate_summary_report(self) -> None:
        """生成初始化总结报告"""
        logger.info("📊 生成初始化总结报告...")
        
        print("\n" + "="*60)
        print("🎯 数据库初始化总结报告")
        print("="*60)
        
        print(f"📅 执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📁 日志文件: {log_file}")
        print(f"✅ 成功操作: {self.success_count}")
        print(f"❌ 失败操作: {self.error_count}")
        
        if self.error_count == 0:
            print("\n🎉 数据库初始化成功完成!")
            print("🚀 现在可以启动应用程序了:")
            print("   python run.py")
            print("   或")
            print("   uvicorn app.main:app --host localhost --port 8000 --reload")
        else:
            print(f"\n⚠️ 初始化过程中出现 {self.error_count} 个错误")
            print("📋 请检查日志文件获取详细信息")
        
        print("\n📖 API 文档地址:")
        print("   http://localhost:8000/docs")
        print("="*60)
    
    def run_initialization(self) -> bool:
        """执行完整的数据库初始化流程"""
        logger.info("🚀 开始数据库初始化流程...")
        print("Health Empire HQ - 数据库初始化工具")
        print("="*50)
        
        try:
            # 1. 验证配置
            if not self.validate_configuration():
                return False
            
            # 2. 测试连接
            if not self.test_database_connection():
                return False
            
            # 3. 检查现有表
            existing_info = self.check_existing_tables()
            
            # 4. 创建表结构
            if not self.create_database_tables():
                return False
            
            # 5. 验证表结构
            if not self.verify_table_structure():
                return False
            
            # 6. 性能优化
            if not self.optimize_database_performance():
                return False
            
            # 7. 生成报告
            self.generate_summary_report()
            
            return self.error_count == 0
            
        except KeyboardInterrupt:
            logger.info("⚠️ 用户中断了初始化过程")
            return False
        except Exception as e:
            self.log_operation("初始化流程", "error", f"未知错误: {e}")
            logger.exception("初始化过程中出现异常")
            return False


def main():
    """主函数"""
    try:
        initializer = DatabaseInitializer()
        success = initializer.run_initialization()
        
        if success:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        logger.exception(f"主函数异常: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
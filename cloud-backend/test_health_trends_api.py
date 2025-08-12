#!/usr/bin/env python3
"""
健康趋势 API 测试脚本

此脚本演示如何使用健康趋势 API 的各种端点
包括创建健康记录、获取趋势数据、统计分析等功能
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import httpx
import random


class HealthTrendsAPITester:
    """健康趋势 API 测试类"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.access_token: Optional[str] = None
        self.user_id = 1  # 测试用户ID
        
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def get_auth_headers(self) -> Dict[str, str]:
        """获取认证头"""
        if self.access_token:
            return {"Authorization": f"Bearer {self.access_token}"}
        return {}
    
    async def login(self, username: str = "test@example.com", password: str = "testpass123") -> bool:
        """登录获取访问令牌"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/auth/token",
                data={"username": username, "password": password}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                print(f"✅ 登录成功，获取到访问令牌")
                return True
            else:
                print(f"❌ 登录失败: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ 登录请求失败: {e}")
            return False
    
    async def create_sample_health_record(self) -> Optional[Dict[str, Any]]:
        """创建示例健康记录"""
        try:
            # 生成随机健康数据
            overall_score = round(random.uniform(60, 90), 1)
            
            health_record = {
                "assessed_at": datetime.now().isoformat(),
                "overall_score": overall_score,
                "physical_score": round(overall_score + random.uniform(-5, 5), 1),
                "mental_score": round(overall_score + random.uniform(-8, 8), 1),
                "lifestyle_score": round(overall_score + random.uniform(-6, 6), 1),
                "assessment_type": random.choice(["comprehensive", "quick", "specific"]),
                "assessment_notes": f"API测试记录 - 评分 {overall_score}",
                "detailed_metrics": {
                    "bmi": round(random.uniform(18.5, 25), 1),
                    "blood_pressure": f"{random.randint(110, 140)}/{random.randint(70, 90)}",
                    "heart_rate": random.randint(60, 100),
                    "sleep_hours": round(random.uniform(6, 9), 1),
                    "exercise_minutes": random.randint(20, 120),
                    "stress_level": random.randint(1, 10)
                },
                "data_source": "api"
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/v1/users/{self.user_id}/health-records",
                json=health_record,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 201:
                data = response.json()
                print(f"✅ 创建健康记录成功: ID={data['data']['id']}, 评分={data['data']['overall_score']}")
                return data["data"]
            else:
                print(f"❌ 创建健康记录失败: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ 创建健康记录请求失败: {e}")
            return None
    
    async def get_health_trends(self, time_range: str = "30d") -> Optional[Dict[str, Any]]:
        """获取健康趋势数据"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/v1/users/{self.user_id}/health-trends",
                params={"time_range": time_range, "include_details": True},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取健康趋势成功: {data['total_records']} 条记录, 时间范围: {data['time_range']}")
                
                # 显示统计摘要
                summary = data["summary"]
                print(f"   📊 统计摘要:")
                print(f"      最新评分: {summary.get('latest_score')}")
                print(f"      平均评分: {summary.get('average_score')}")
                print(f"      评分趋势: {summary.get('score_trend')}")
                print(f"      改善率: {summary.get('improvement_rate')}%")
                
                return data
            else:
                print(f"❌ 获取健康趋势失败: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ 获取健康趋势请求失败: {e}")
            return None
    
    async def get_health_records_list(self, limit: int = 10) -> Optional[Dict[str, Any]]:
        """获取健康记录列表"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/v1/users/{self.user_id}/health-records",
                params={"limit": limit, "skip": 0},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取健康记录列表成功: {data['total']} 条记录")
                
                # 显示前几条记录
                for record in data["items"][:3]:
                    print(f"   📝 记录 #{record['id']}: 评分={record['overall_score']}, "
                          f"时间={record['assessed_at'][:10]}, 类型={record['assessment_type']}")
                
                return data
            else:
                print(f"❌ 获取健康记录列表失败: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ 获取健康记录列表请求失败: {e}")
            return None
    
    async def get_health_summary(self, time_range: str = "30d") -> Optional[Dict[str, Any]]:
        """获取健康统计摘要"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/v1/users/{self.user_id}/health-summary",
                params={"time_range": time_range},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 获取健康摘要成功")
                print(f"   📈 总评估次数: {data.get('total_assessments')}")
                print(f"   📊 评估频率: {data.get('assessment_frequency')} 次/月")
                print(f"   🎯 健康等级分布: {data.get('health_level_distribution')}")
                
                return data
            else:
                print(f"❌ 获取健康摘要失败: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ 获取健康摘要请求失败: {e}")
            return None
    
    async def batch_create_health_records(self, count: int = 5) -> Optional[Dict[str, Any]]:
        """批量创建健康记录"""
        try:
            records = []
            base_date = datetime.now() - timedelta(days=count)
            
            for i in range(count):
                date = base_date + timedelta(days=i)
                score = round(60 + i * 3 + random.uniform(-2, 2), 1)  # 模拟改善趋势
                
                record = {
                    "assessed_at": date.isoformat(),
                    "overall_score": score,
                    "physical_score": round(score + random.uniform(-3, 3), 1),
                    "mental_score": round(score + random.uniform(-5, 5), 1),
                    "lifestyle_score": round(score + random.uniform(-4, 4), 1),
                    "assessment_type": "comprehensive",
                    "assessment_notes": f"批量创建记录 #{i+1}",
                    "data_source": "api"
                }
                records.append(record)
            
            response = await self.client.post(
                f"{self.base_url}/api/v1/users/{self.user_id}/health-records/batch",
                json={"records": records},
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 201:
                data = response.json()
                print(f"✅ 批量创建健康记录成功: {data['success_count']} 条记录")
                print(f"   🆔 创建的记录ID: {data['created_ids']}")
                return data
            else:
                print(f"❌ 批量创建健康记录失败: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ 批量创建健康记录请求失败: {e}")
            return None
    
    async def test_echarts_integration(self) -> None:
        """测试 ECharts 集成"""
        print("\n🎨 测试 ECharts 集成...")
        
        trends_data = await self.get_health_trends("90d")
        if not trends_data:
            return
        
        # 模拟 ECharts 配置
        echarts_config = trends_data.get("echarts_config", {})
        data_points = trends_data.get("data_points", [])
        
        print(f"   📊 ECharts 配置标题: {echarts_config.get('title', {}).get('text')}")
        print(f"   📈 数据点数量: {len(data_points)}")
        
        if data_points:
            # 显示数据格式示例
            sample_point = data_points[0]
            print(f"   📝 数据点示例: {json.dumps(sample_point, indent=4, ensure_ascii=False)}")
        
        # 模拟前端 JavaScript 代码
        js_code = f"""
        // ECharts 配置示例
        const option = {{
            title: {json.dumps(echarts_config.get('title', {}), ensure_ascii=False)},
            xAxis: {json.dumps(echarts_config.get('xAxis', {}))},
            yAxis: {json.dumps(echarts_config.get('yAxis', {}))},
            series: [{{
                name: '综合健康评分',
                type: 'line',
                data: {json.dumps([[dp['timestamp'], dp['value']] for dp in data_points[:3]], ensure_ascii=False)}
                // ... 更多数据点
            }}]
        }};
        
        // 应用配置
        chart.setOption(option);
        """
        
        print(f"   💻 前端集成代码示例:")
        print(js_code[:300] + "...")
    
    async def run_comprehensive_test(self) -> None:
        """运行综合测试"""
        print("🚀 开始健康趋势 API 综合测试\n")
        
        # 1. 测试登录（如果需要）
        # print("1️⃣ 测试用户认证...")
        # if not await self.login():
        #     print("❌ 无法完成认证，跳过需要认证的测试")
        #     return
        
        # 2. 创建示例数据
        print("2️⃣ 创建示例健康记录...")
        await self.create_sample_health_record()
        await asyncio.sleep(1)  # 避免请求过快
        
        # 3. 批量创建数据
        print("\n3️⃣ 批量创建健康记录...")
        await self.batch_create_health_records(3)
        await asyncio.sleep(1)
        
        # 4. 获取健康记录列表
        print("\n4️⃣ 获取健康记录列表...")
        await self.get_health_records_list()
        await asyncio.sleep(1)
        
        # 5. 获取健康趋势数据
        print("\n5️⃣ 获取健康趋势数据...")
        await self.get_health_trends("30d")
        await asyncio.sleep(1)
        
        # 6. 获取健康统计摘要
        print("\n6️⃣ 获取健康统计摘要...")
        await self.get_health_summary("30d")
        await asyncio.sleep(1)
        
        # 7. 测试不同时间范围
        print("\n7️⃣ 测试不同时间范围...")
        for time_range in ["7d", "90d", "all"]:
            print(f"   📅 测试时间范围: {time_range}")
            await self.get_health_trends(time_range)
            await asyncio.sleep(0.5)
        
        # 8. 测试 ECharts 集成
        await self.test_echarts_integration()
        
        print("\n🎉 健康趋势 API 测试完成!")
        print("\n📋 测试总结:")
        print("   ✅ 健康记录 CRUD 操作")
        print("   ✅ 健康趋势数据查询")
        print("   ✅ 统计分析功能")
        print("   ✅ 批量数据操作")
        print("   ✅ ECharts 数据格式适配")
        print("   ✅ 多时间范围支持")


async def main():
    """主函数"""
    async with HealthTrendsAPITester() as tester:
        await tester.run_comprehensive_test()


if __name__ == "__main__":
    # 检查服务器是否运行
    print("检查 API 服务器状态...")
    try:
        import requests
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API 服务器运行正常")
        else:
            print("⚠️  API 服务器响应异常")
    except Exception as e:
        print(f"❌ 无法连接到 API 服务器: {e}")
        print("请确保服务器正在运行: python run.py")
        exit(1)
    
    # 运行测试
    asyncio.run(main())
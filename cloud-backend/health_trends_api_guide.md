# 健康趋势 API 使用指南

## 概述

健康趋势 API 为 Health Empire HQ 系统提供完整的健康数据管理和趋势分析功能。该 API 设计专门适配 ECharts 图表展示，支持多维度健康数据分析。

## 核心功能

- ✅ 健康记录 CRUD 操作
- ✅ 健康趋势数据查询
- ✅ 多时间范围分析（7天-1年）
- ✅ ECharts 数据格式适配
- ✅ 健康统计摘要
- ✅ 批量数据操作
- ✅ 权限控制和数据安全

## API 端点一览

### 🔥 核心端点：健康趋势数据

```http
GET /api/v1/users/{user_id}/health-trends
```

**最重要的端点** - 获取适合 ECharts 图表展示的健康趋势数据

#### 查询参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `time_range` | string | `30d` | 时间范围：`7d`, `30d`, `90d`, `180d`, `365d`, `all` |
| `start_date` | datetime | null | 自定义开始时间 (YYYY-MM-DD HH:MM:SS) |
| `end_date` | datetime | null | 自定义结束时间 (YYYY-MM-DD HH:MM:SS) |
| `assessment_type` | string | null | 评估类型：`comprehensive`, `quick`, `specific` |
| `data_source` | string | null | 数据来源：`manual`, `device`, `api` |
| `include_details` | boolean | false | 是否包含详细指标 |
| `limit` | integer | 100 | 返回记录数限制 (1-1000) |

#### 响应示例

```json
{
  "data_points": [
    {
      "date": "2024-01-15",
      "timestamp": 1705286400000,
      "value": 75.5,
      "physical": 78.0,
      "mental": 72.5,
      "lifestyle": 76.0,
      "level": "good",
      "type": "comprehensive"
    }
  ],
  "summary": {
    "latest_score": 75.5,
    "average_score": 73.2,
    "max_score": 85.0,
    "min_score": 65.0,
    "score_trend": "rising",
    "total_assessments": 15,
    "assessment_frequency": 2.5,
    "health_level_distribution": {
      "excellent": 3,
      "good": 8,
      "fair": 4,
      "poor": 0
    },
    "improvement_rate": 12.5
  },
  "time_range": "最近30天",
  "total_records": 15,
  "echarts_config": {
    "title": {
      "text": "健康趋势分析",
      "subtext": "共 15 次评估，平均分 73.2"
    },
    "xAxis": { "type": "time" },
    "yAxis": { "type": "value", "min": 0, "max": 100 },
    "series": [
      {
        "name": "综合健康评分",
        "type": "line",
        "smooth": true,
        "data": [[1705286400000, 75.5]]
      }
    ]
  }
}
```

### 🔸 健康记录管理

#### 获取健康记录列表
```http
GET /api/v1/users/{user_id}/health-records
```

**查询参数：**
- `skip`: 跳过记录数 (分页)
- `limit`: 每页记录数 (1-100)
- `assessment_type`: 评估类型筛选
- `data_source`: 数据来源筛选  
- `start_date`: 开始日期
- `end_date`: 结束日期

#### 创建健康记录
```http
POST /api/v1/users/{user_id}/health-records
```

**请求体示例：**
```json
{
  "assessed_at": "2024-01-15T10:30:00Z",
  "overall_score": 75.5,
  "physical_score": 78.0,
  "mental_score": 72.5,
  "lifestyle_score": 76.0,
  "assessment_type": "comprehensive",
  "assessment_notes": "定期健康评估",
  "detailed_metrics": {
    "bmi": 23.5,
    "blood_pressure": "120/80",
    "heart_rate": 72,
    "sleep_hours": 7.5,
    "exercise_minutes": 45,
    "stress_level": 3
  },
  "data_source": "manual"
}
```

#### 获取单个健康记录
```http
GET /api/v1/users/{user_id}/health-records/{record_id}
```

#### 更新健康记录
```http
PUT /api/v1/users/{user_id}/health-records/{record_id}
```

#### 删除健康记录
```http
DELETE /api/v1/users/{user_id}/health-records/{record_id}
```

### 🔸 统计和分析

#### 获取健康统计摘要
```http
GET /api/v1/users/{user_id}/health-summary?time_range=30d
```

#### 获取最新健康记录
```http
GET /api/v1/users/{user_id}/health-records/latest
```

#### 批量创建健康记录
```http
POST /api/v1/users/{user_id}/health-records/batch
```

**请求体示例：**
```json
{
  "records": [
    {
      "assessed_at": "2024-01-15T10:30:00Z",
      "overall_score": 75.5,
      "assessment_type": "comprehensive",
      "data_source": "device"
    },
    {
      "assessed_at": "2024-01-16T10:30:00Z", 
      "overall_score": 76.2,
      "assessment_type": "quick",
      "data_source": "device"
    }
  ]
}
```

## 🎯 前端集成指南

### ECharts 图表集成

1. **获取趋势数据**
```javascript
const response = await fetch('/api/v1/users/1/health-trends?time_range=30d');
const data = await response.json();
```

2. **配置 ECharts**
```javascript
const option = {
  ...data.echarts_config,
  series: [{
    ...data.echarts_config.series[0],
    data: data.data_points.map(point => [point.timestamp, point.value])
  }]
};

chart.setOption(option);
```

3. **多系列图表（分类评分）**
```javascript
const series = [
  {
    name: '综合评分',
    data: data.data_points.map(p => [p.timestamp, p.value])
  },
  {
    name: '身体健康', 
    data: data.data_points.map(p => [p.timestamp, p.physical])
  },
  {
    name: '心理健康',
    data: data.data_points.map(p => [p.timestamp, p.mental])
  },
  {
    name: '生活方式',
    data: data.data_points.map(p => [p.timestamp, p.lifestyle])
  }
];
```

### 数据刷新策略

```javascript
// 定时刷新健康数据
setInterval(async () => {
  const latestData = await fetch('/api/v1/users/1/health-records/latest');
  updateHealthDashboard(latestData);
}, 300000); // 每5分钟刷新一次
```

## 🔐 权限和安全

- **身份验证**：所有端点需要有效的 JWT Token
- **权限控制**：用户只能访问自己的健康数据
- **数据验证**：所有输入数据经过严格验证
- **HTTPS 传输**：生产环境强制使用 HTTPS

## 📊 数据模型

### 健康记录字段

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `id` | integer | 是 | 记录唯一标识 |
| `user_id` | integer | 是 | 用户ID |
| `assessed_at` | datetime | 是 | 评估时间 |
| `overall_score` | float | 是 | 综合评分 (0-100) |
| `physical_score` | float | 否 | 身体健康评分 (0-100) |
| `mental_score` | float | 否 | 心理健康评分 (0-100) |
| `lifestyle_score` | float | 否 | 生活方式评分 (0-100) |
| `assessment_type` | string | 是 | 评估类型 |
| `health_level` | string | 是 | 健康等级 (自动计算) |
| `assessment_notes` | string | 否 | 评估备注 |
| `detailed_metrics` | json | 否 | 详细健康指标 |
| `data_source` | string | 是 | 数据来源 |
| `created_at` | datetime | 是 | 创建时间 |
| `updated_at` | datetime | 是 | 更新时间 |

### 健康等级计算规则

- **优秀 (excellent)**: 80-100分
- **良好 (good)**: 60-79分  
- **一般 (fair)**: 40-59分
- **较差 (poor)**: 0-39分

## 🚀 快速开始

### 1. 启动服务

```bash
python run.py
```

### 2. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. 获取访问令牌

```bash
curl -X POST "http://localhost:8000/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your_username&password=your_password"
```

### 4. 调用健康趋势 API

```bash
curl -X GET "http://localhost:8000/api/v1/users/1/health-trends?time_range=30d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 配置选项

### 时间范围配置

- `7d`: 最近7天
- `30d`: 最近30天 (默认)
- `90d`: 最近90天
- `180d`: 最近半年
- `365d`: 最近1年
- `all`: 全部时间

### 评估类型

- `comprehensive`: 综合评估 (推荐)
- `quick`: 快速评估
- `specific`: 专项评估

### 数据来源

- `manual`: 手动输入
- `device`: 设备采集
- `api`: API接入

## 📝 最佳实践

### 1. 数据录入频率
- **建议频率**: 每周至少2-3次
- **最佳实践**: 每日记录，周度分析

### 2. 评分规范
- 保持评分标准一致性
- 定期校准评估方法
- 结合客观指标和主观感受

### 3. 趋势分析
- 关注长期趋势而非短期波动
- 结合多个维度进行综合分析
- 设置合理的目标和预期

### 4. 性能优化
- 使用适当的时间范围查询
- 启用客户端缓存
- 合理设置数据刷新频率

## 🐛 故障排除

### 常见错误

1. **403 权限错误**: 检查 JWT Token 是否有效
2. **404 用户不存在**: 确认用户ID正确
3. **400 数据验证失败**: 检查输入数据格式
4. **500 服务器错误**: 查看服务器日志

### 调试技巧

```bash
# 查看API详细响应
curl -v -X GET "http://localhost:8000/api/v1/users/1/health-trends"

# 测试数据库连接
python -c "from app.database import check_database_connection; print(check_database_connection())"
```

## 📈 示例应用

查看完整的前端示例：`health_trends_example.html`

这个示例展示了：
- 完整的 ECharts 图表集成
- 动态数据加载和刷新
- 多维度健康数据展示
- 响应式设计和用户交互

---

## 🎉 总结

健康趋势 API 提供了完整的健康数据管理解决方案，特别针对 ECharts 图表展示进行了优化。通过合理使用这些 API，可以构建强大的健康监测和分析应用。

**核心优势：**
- 🎯 专为 ECharts 优化的数据格式
- 📊 丰富的统计和分析功能  
- 🔒 完善的权限和安全控制
- 🚀 高性能的数据查询和处理
- 📱 支持多平台和多设备接入
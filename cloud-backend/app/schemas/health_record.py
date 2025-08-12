from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from enum import Enum

from pydantic import BaseModel, Field, field_validator


# 枚举类型定义
class AssessmentType(str, Enum):
    """评估类型枚举"""
    COMPREHENSIVE = "comprehensive"  # 综合评估
    QUICK = "quick"                 # 快速评估
    SPECIFIC = "specific"           # 专项评估


class HealthLevel(str, Enum):
    """健康等级枚举"""
    EXCELLENT = "excellent"  # 优秀 (80-100分)
    GOOD = "good"           # 良好 (60-79分)
    FAIR = "fair"           # 一般 (40-59分)
    POOR = "poor"           # 较差 (0-39分)


class DataSource(str, Enum):
    """数据来源枚举"""
    MANUAL = "manual"       # 手动输入
    DEVICE = "device"       # 设备采集
    API = "api"            # API接入


class TimeRange(str, Enum):
    """时间范围枚举"""
    WEEK = "7d"            # 最近7天
    MONTH = "30d"          # 最近30天
    QUARTER = "90d"        # 最近90天
    HALF_YEAR = "180d"     # 最近半年
    YEAR = "365d"          # 最近1年
    ALL = "all"            # 全部时间


# 健康记录基础模式
class HealthRecordBase(BaseModel):
    """健康记录基础数据模式"""
    assessed_at: datetime = Field(..., description="评估时间")
    overall_score: float = Field(..., ge=0, le=100, description="综合健康评分 (0-100分)")
    physical_score: Optional[float] = Field(None, ge=0, le=100, description="身体健康评分 (0-100分)")
    mental_score: Optional[float] = Field(None, ge=0, le=100, description="心理健康评分 (0-100分)")
    lifestyle_score: Optional[float] = Field(None, ge=0, le=100, description="生活方式评分 (0-100分)")
    assessment_type: AssessmentType = Field(AssessmentType.COMPREHENSIVE, description="评估类型")
    assessment_notes: Optional[str] = Field(None, max_length=1000, description="评估备注和建议")
    detailed_metrics: Optional[Dict[str, Any]] = Field(None, description="详细健康指标数据")
    data_source: DataSource = Field(DataSource.MANUAL, description="数据来源")

    @field_validator('overall_score', 'physical_score', 'mental_score', 'lifestyle_score')
    @classmethod
    def validate_scores(cls, v: Optional[float]) -> Optional[float]:
        """验证评分范围"""
        if v is not None and (v < 0 or v > 100):
            raise ValueError('评分必须在0-100之间')
        return v


# 创建健康记录的输入模式
class HealthRecordCreate(HealthRecordBase):
    """创建健康记录的数据模式"""
    pass


# 更新健康记录的输入模式
class HealthRecordUpdate(BaseModel):
    """更新健康记录的数据模式"""
    assessed_at: Optional[datetime] = Field(None, description="评估时间")
    overall_score: Optional[float] = Field(None, ge=0, le=100, description="综合健康评分")
    physical_score: Optional[float] = Field(None, ge=0, le=100, description="身体健康评分")
    mental_score: Optional[float] = Field(None, ge=0, le=100, description="心理健康评分")
    lifestyle_score: Optional[float] = Field(None, ge=0, le=100, description="生活方式评分")
    assessment_type: Optional[AssessmentType] = Field(None, description="评估类型")
    assessment_notes: Optional[str] = Field(None, max_length=1000, description="评估备注")
    detailed_metrics: Optional[Dict[str, Any]] = Field(None, description="详细健康指标数据")
    data_source: Optional[DataSource] = Field(None, description="数据来源")


# 数据库中的健康记录模式（返回给客户端）
class HealthRecord(HealthRecordBase):
    """完整的健康记录数据模式"""
    id: int = Field(..., description="健康记录ID")
    user_id: int = Field(..., description="用户ID")
    health_level: HealthLevel = Field(..., description="健康等级")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    model_config = {"from_attributes": True}


# ECharts 数据点模式
class EChartsDataPoint(BaseModel):
    """ECharts 图表数据点模式"""
    date: str = Field(..., description="日期字符串 (YYYY-MM-DD)")
    timestamp: int = Field(..., description="时间戳 (毫秒)")
    value: float = Field(..., description="主要数值 (综合评分)")
    physical: Optional[float] = Field(None, description="身体健康评分")
    mental: Optional[float] = Field(None, description="心理健康评分")
    lifestyle: Optional[float] = Field(None, description="生活方式评分")
    level: HealthLevel = Field(..., description="健康等级")
    type: AssessmentType = Field(..., description="评估类型")


# 健康趋势查询参数
class HealthTrendsQuery(BaseModel):
    """健康趋势查询参数模式"""
    time_range: TimeRange = Field(TimeRange.MONTH, description="时间范围")
    start_date: Optional[datetime] = Field(None, description="开始日期 (自定义时间范围)")
    end_date: Optional[datetime] = Field(None, description="结束日期 (自定义时间范围)")
    assessment_type: Optional[AssessmentType] = Field(None, description="筛选评估类型")
    data_source: Optional[DataSource] = Field(None, description="筛选数据来源")
    include_details: bool = Field(False, description="是否包含详细指标")
    limit: int = Field(100, ge=1, le=1000, description="返回记录数限制")

    @field_validator('end_date')
    @classmethod
    def validate_date_range(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """验证日期范围"""
        if v is not None and info.data.get('start_date') is not None:
            if v <= info.data['start_date']:
                raise ValueError('结束日期必须晚于开始日期')
        return v


# 健康趋势响应模式
class HealthTrendsResponse(BaseModel):
    """健康趋势响应数据模式"""
    data_points: List[EChartsDataPoint] = Field(..., description="图表数据点列表")
    summary: Dict[str, Any] = Field(..., description="统计摘要信息")
    time_range: str = Field(..., description="实际查询的时间范围")
    total_records: int = Field(..., description="总记录数")
    
    # ECharts 特定配置
    echarts_config: Dict[str, Any] = Field(..., description="ECharts 图表配置建议")


# 健康统计摘要模式
class HealthSummary(BaseModel):
    """健康统计摘要模式"""
    latest_score: Optional[float] = Field(None, description="最新评分")
    average_score: Optional[float] = Field(None, description="平均评分")
    max_score: Optional[float] = Field(None, description="最高评分")
    min_score: Optional[float] = Field(None, description="最低评分")
    score_trend: str = Field(..., description="评分趋势 (rising/falling/stable)")
    total_assessments: int = Field(..., description="总评估次数")
    assessment_frequency: float = Field(..., description="评估频率 (次/月)")
    health_level_distribution: Dict[str, int] = Field(..., description="健康等级分布")
    improvement_rate: Optional[float] = Field(None, description="改善率 (%)")


# 健康记录列表响应模式
class HealthRecordListResponse(BaseModel):
    """健康记录列表响应数据模式"""
    items: List[HealthRecord] = Field(..., description="健康记录列表")
    total: int = Field(..., description="总记录数")
    page: int = Field(..., description="当前页码")
    size: int = Field(..., description="页面大小")
    pages: int = Field(..., description="总页数")


# 通用响应模式
class HealthRecordResponse(BaseModel):
    """健康记录操作响应模式"""
    data: HealthRecord = Field(..., description="健康记录数据")
    message: str = Field("操作成功", description="响应消息")


class Message(BaseModel):
    """通用消息响应模式"""
    message: str = Field(..., description="响应消息")


# 批量操作模式
class BatchHealthRecordCreate(BaseModel):
    """批量创建健康记录的数据模式"""
    records: List[HealthRecordCreate] = Field(..., min_items=1, max_items=100, description="健康记录列表")

    @field_validator('records')
    @classmethod
    def validate_records_count(cls, v: List[HealthRecordCreate]) -> List[HealthRecordCreate]:
        """验证记录数量"""
        if len(v) > 100:
            raise ValueError('单次批量创建不能超过100条记录')
        return v


class BatchResponse(BaseModel):
    """批量操作响应模式"""
    success_count: int = Field(..., description="成功处理的记录数")
    failed_count: int = Field(..., description="失败处理的记录数")
    errors: List[str] = Field(default_factory=list, description="错误信息列表")
    created_ids: List[int] = Field(default_factory=list, description="成功创建的记录ID列表")
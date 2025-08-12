from datetime import datetime
from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import Boolean, String, DateTime, Float, Text, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class HealthRecord(Base):
    """
    健康记录模型 - 使用 SQLAlchemy 2.0+ 现代语法
    
    用于存储用户的健康评估记录和趋势数据
    支持多维度健康评分和详细的健康指标跟踪
    """
    __tablename__ = "health_records"
    
    # 表级约束和索引
    __table_args__ = (
        # 检查约束 - 确保评分在合理范围内
        CheckConstraint(
            "overall_score >= 0 AND overall_score <= 100", 
            name='ck_overall_score_range'
        ),
        CheckConstraint(
            "physical_score IS NULL OR (physical_score >= 0 AND physical_score <= 100)", 
            name='ck_physical_score_range'
        ),
        CheckConstraint(
            "mental_score IS NULL OR (mental_score >= 0 AND mental_score <= 100)", 
            name='ck_mental_score_range'
        ),
        CheckConstraint(
            "lifestyle_score IS NULL OR (lifestyle_score >= 0 AND lifestyle_score <= 100)", 
            name='ck_lifestyle_score_range'
        ),
        
        # 性能优化索引
        Index('ix_health_records_user_date', 'user_id', 'assessed_at'),
        Index('ix_health_records_score_level', 'overall_score', 'health_level'),
        Index('ix_health_records_assessment_type', 'assessment_type'),
        Index('ix_health_records_time_range', 'assessed_at', 'user_id'),
        Index('ix_health_records_full_search', 'user_id', 'assessment_type', 'health_level'),
    )

    # 主键字段
    id: Mapped[int] = mapped_column(
        primary_key=True, 
        index=True, 
        autoincrement=True,
        comment="健康记录唯一标识符"
    )
    
    # 关联用户字段
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True,
        comment="关联的用户ID"
    )
    
    # 评估时间
    assessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False,
        index=True,
        comment="健康评估时间"
    )
    
    # 综合健康评分
    overall_score: Mapped[float] = mapped_column(
        Float(precision=5, scale=2), 
        nullable=False,
        index=True,
        comment="综合健康评分 (0-100)"
    )
    
    # 分类健康评分
    physical_score: Mapped[Optional[float]] = mapped_column(
        Float(precision=5, scale=2), 
        nullable=True,
        comment="身体健康评分 (0-100)"
    )
    
    mental_score: Mapped[Optional[float]] = mapped_column(
        Float(precision=5, scale=2), 
        nullable=True,
        comment="心理健康评分 (0-100)"
    )
    
    lifestyle_score: Mapped[Optional[float]] = mapped_column(
        Float(precision=5, scale=2), 
        nullable=True,
        comment="生活方式评分 (0-100)"
    )
    
    # 评估类型
    assessment_type: Mapped[str] = mapped_column(
        String(50), 
        nullable=False,
        index=True,
        comment="评估类型 (comprehensive, quick, specialized)"
    )
    
    # 健康等级
    health_level: Mapped[Optional[str]] = mapped_column(
        String(20), 
        nullable=True,
        index=True,
        comment="健康等级 (excellent, good, fair, poor)"
    )
    
    # 详细健康指标 (JSON格式存储)
    detailed_metrics: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, 
        nullable=True,
        comment="详细健康指标数据 (JSON格式)"
    )
    
    # 评估备注
    notes: Mapped[Optional[str]] = mapped_column(
        Text, 
        nullable=True,
        comment="评估备注和说明"
    )
    
    # 数据来源
    data_source: Mapped[str] = mapped_column(
        String(50), 
        default="manual",
        nullable=False,
        comment="数据来源 (manual, device, api)"
    )
    
    # 是否有效记录
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        nullable=False,
        comment="记录是否有效"
    )
    
    # 时间戳字段
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        comment="记录创建时间"
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False,
        comment="记录更新时间"
    )

    # 外键关系
    user: Mapped["User"] = relationship(
        "User", 
        back_populates="health_records",
        lazy="select"
    )

    def __repr__(self) -> str:
        """健康记录对象的字符串表示"""
        return (
            f"<HealthRecord(id={self.id}, user_id={self.user_id}, "
            f"score={self.overall_score}, type='{self.assessment_type}', "
            f"date='{self.assessed_at.strftime('%Y-%m-%d')}')>"
        )
    
    def __str__(self) -> str:
        """健康记录对象的友好字符串表示"""
        return f"健康记录 #{self.id} - 评分: {self.overall_score} ({self.assessed_at.strftime('%Y-%m-%d')})"
    
    @property
    def score_level_text(self) -> str:
        """获取评分等级的中文描述"""
        if self.overall_score >= 90:
            return "优秀"
        elif self.overall_score >= 80:
            return "良好"
        elif self.overall_score >= 70:
            return "一般"
        elif self.overall_score >= 60:
            return "需要改善"
        else:
            return "需要关注"
    
    @property
    def assessment_type_text(self) -> str:
        """获取评估类型的中文描述"""
        type_map = {
            "comprehensive": "综合评估",
            "quick": "快速评估",
            "specialized": "专项评估",
            "self": "自我评估",
            "doctor": "医生评估"
        }
        return type_map.get(self.assessment_type, self.assessment_type)
    
    def calculate_health_level(self) -> str:
        """根据综合评分计算健康等级"""
        if self.overall_score >= 90:
            return "excellent"
        elif self.overall_score >= 80:
            return "good"
        elif self.overall_score >= 60:
            return "fair"
        else:
            return "poor"
    
    def get_score_breakdown(self) -> Dict[str, Optional[float]]:
        """获取分类评分详情"""
        return {
            "overall": self.overall_score,
            "physical": self.physical_score,
            "mental": self.mental_score,
            "lifestyle": self.lifestyle_score
        }
    
    def to_trend_point(self) -> Dict[str, Any]:
        """转换为趋势图表数据点格式（适用于ECharts）"""
        return {
            "date": self.assessed_at.strftime('%Y-%m-%d'),
            "timestamp": int(self.assessed_at.timestamp() * 1000),
            "value": float(self.overall_score),
            "physical": float(self.physical_score) if self.physical_score else None,
            "mental": float(self.mental_score) if self.mental_score else None,
            "lifestyle": float(self.lifestyle_score) if self.lifestyle_score else None,
            "level": self.health_level or self.calculate_health_level(),
            "type": self.assessment_type,
            "source": self.data_source
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """获取健康记录摘要信息"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "assessed_at": self.assessed_at.isoformat(),
            "overall_score": self.overall_score,
            "score_breakdown": self.get_score_breakdown(),
            "assessment_type": self.assessment_type,
            "assessment_type_text": self.assessment_type_text,
            "health_level": self.health_level or self.calculate_health_level(),
            "score_level_text": self.score_level_text,
            "data_source": self.data_source,
            "has_notes": bool(self.notes),
            "has_detailed_metrics": bool(self.detailed_metrics),
            "is_active": self.is_active
        }
    
    @classmethod
    def create_sample_record(cls, user_id: int, score: float = None, assessment_type: str = "comprehensive") -> "HealthRecord":
        """创建示例健康记录"""
        import random
        from datetime import datetime, timedelta
        
        # 生成随机评分（如果未提供）
        if score is None:
            score = random.uniform(60.0, 95.0)
        
        # 生成分类评分
        physical = score + random.uniform(-10, 10)
        mental = score + random.uniform(-10, 10)
        lifestyle = score + random.uniform(-10, 10)
        
        # 确保评分在合理范围内
        physical = max(0, min(100, physical))
        mental = max(0, min(100, mental))
        lifestyle = max(0, min(100, lifestyle))
        
        return cls(
            user_id=user_id,
            assessed_at=datetime.now() - timedelta(days=random.randint(0, 90)),
            overall_score=score,
            physical_score=physical,
            mental_score=mental,
            lifestyle_score=lifestyle,
            assessment_type=assessment_type,
            health_level="excellent" if score >= 90 else "good" if score >= 80 else "fair" if score >= 60 else "poor",
            detailed_metrics={
                "bmi": random.uniform(18.5, 24.9),
                "blood_pressure": f"{random.randint(110, 140)}/{random.randint(70, 90)}",
                "heart_rate": random.randint(60, 100),
                "sleep_hours": random.uniform(6.5, 9.0),
                "exercise_minutes": random.randint(0, 180),
                "stress_level": random.randint(1, 10)
            },
            data_source=random.choice(["manual", "device", "api"])
        )
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_, or_, func, text
from sqlalchemy.sql import select

from app.models.health_record import HealthRecord
from app.schemas.health_record import (
    HealthRecordCreate, 
    HealthRecordUpdate, 
    TimeRange,
    AssessmentType,
    DataSource,
    HealthLevel,
    EChartsDataPoint,
    HealthSummary
)


class CRUDHealthRecord:
    """健康记录 CRUD 操作类"""

    def __init__(self, model: type[HealthRecord]):
        self.model = model

    def create(self, db: Session, *, obj_in: HealthRecordCreate, user_id: int) -> HealthRecord:
        """
        创建健康记录
        
        Args:
            db: 数据库会话
            obj_in: 创建数据
            user_id: 用户ID
            
        Returns:
            创建的健康记录对象
        """
        # 根据评分计算健康等级
        health_level = self._calculate_health_level(obj_in.overall_score)
        
        db_obj = HealthRecord(
            user_id=user_id,
            assessed_at=obj_in.assessed_at,
            overall_score=obj_in.overall_score,
            physical_score=obj_in.physical_score,
            mental_score=obj_in.mental_score,
            lifestyle_score=obj_in.lifestyle_score,
            assessment_type=obj_in.assessment_type,
            health_level=health_level,
            assessment_notes=obj_in.assessment_notes,
            detailed_metrics=obj_in.detailed_metrics,
            data_source=obj_in.data_source
        )
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, *, record_id: int, user_id: int) -> Optional[HealthRecord]:
        """
        获取用户的单个健康记录
        
        Args:
            db: 数据库会话
            record_id: 记录ID
            user_id: 用户ID
            
        Returns:
            健康记录对象或None
        """
        return db.query(self.model).filter(
            and_(
                self.model.id == record_id,
                self.model.user_id == user_id
            )
        ).first()

    def get_multi(
        self, 
        db: Session, 
        *, 
        user_id: int,
        skip: int = 0, 
        limit: int = 100,
        assessment_type: Optional[AssessmentType] = None,
        data_source: Optional[DataSource] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[HealthRecord]:
        """
        获取用户的多个健康记录
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            skip: 跳过的记录数
            limit: 限制返回的记录数
            assessment_type: 评估类型筛选
            data_source: 数据来源筛选
            start_date: 开始日期
            end_date: 结束日期
            
        Returns:
            健康记录列表
        """
        query = db.query(self.model).filter(self.model.user_id == user_id)
        
        # 添加筛选条件
        if assessment_type:
            query = query.filter(self.model.assessment_type == assessment_type)
        
        if data_source:
            query = query.filter(self.model.data_source == data_source)
        
        if start_date:
            query = query.filter(self.model.assessed_at >= start_date)
        
        if end_date:
            query = query.filter(self.model.assessed_at <= end_date)
        
        return query.order_by(desc(self.model.assessed_at)).offset(skip).limit(limit).all()

    def update(
        self, 
        db: Session, 
        *, 
        db_obj: HealthRecord, 
        obj_in: HealthRecordUpdate
    ) -> HealthRecord:
        """
        更新健康记录
        
        Args:
            db: 数据库会话
            db_obj: 数据库中的记录对象
            obj_in: 更新数据
            
        Returns:
            更新后的健康记录对象
        """
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # 如果更新了评分，重新计算健康等级
        if "overall_score" in update_data:
            update_data["health_level"] = self._calculate_health_level(update_data["overall_score"])
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, record_id: int, user_id: int) -> Optional[HealthRecord]:
        """
        删除健康记录
        
        Args:
            db: 数据库会话
            record_id: 记录ID
            user_id: 用户ID
            
        Returns:
            被删除的健康记录对象或None
        """
        obj = self.get(db=db, record_id=record_id, user_id=user_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_health_trends(
        self, 
        db: Session, 
        *, 
        user_id: int,
        time_range: TimeRange = TimeRange.MONTH,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        assessment_type: Optional[AssessmentType] = None,
        data_source: Optional[DataSource] = None,
        limit: int = 100
    ) -> Tuple[List[HealthRecord], Dict[str, Any]]:
        """
        获取健康趋势数据
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            time_range: 时间范围
            start_date: 自定义开始日期
            end_date: 自定义结束日期
            assessment_type: 评估类型筛选
            data_source: 数据来源筛选
            limit: 返回记录数限制
            
        Returns:
            (健康记录列表, 统计摘要)
        """
        # 计算查询时间范围
        query_start, query_end = self._calculate_time_range(time_range, start_date, end_date)
        
        # 构建查询
        query = db.query(self.model).filter(
            and_(
                self.model.user_id == user_id,
                self.model.assessed_at >= query_start,
                self.model.assessed_at <= query_end
            )
        )
        
        # 添加筛选条件
        if assessment_type:
            query = query.filter(self.model.assessment_type == assessment_type)
        
        if data_source:
            query = query.filter(self.model.data_source == data_source)
        
        # 执行查询，按时间排序
        records = query.order_by(asc(self.model.assessed_at)).limit(limit).all()
        
        # 计算统计摘要
        summary = self._calculate_summary(db, user_id, records, query_start, query_end)
        
        return records, summary

    def get_echarts_data(
        self, 
        db: Session, 
        *, 
        user_id: int,
        time_range: TimeRange = TimeRange.MONTH,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        assessment_type: Optional[AssessmentType] = None,
        data_source: Optional[DataSource] = None,
        limit: int = 100
    ) -> Tuple[List[EChartsDataPoint], Dict[str, Any]]:
        """
        获取适合 ECharts 使用的健康趋势数据
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            time_range: 时间范围
            start_date: 自定义开始日期
            end_date: 自定义结束日期
            assessment_type: 评估类型筛选
            data_source: 数据来源筛选
            limit: 返回记录数限制
            
        Returns:
            (ECharts数据点列表, ECharts配置建议)
        """
        records, summary = self.get_health_trends(
            db=db,
            user_id=user_id,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            assessment_type=assessment_type,
            data_source=data_source,
            limit=limit
        )
        
        # 转换为 ECharts 数据格式
        data_points = [
            EChartsDataPoint(**record.get_echarts_data_point()) 
            for record in records
        ]
        
        # 生成 ECharts 配置建议
        echarts_config = self._generate_echarts_config(data_points, summary)
        
        return data_points, echarts_config

    def get_latest_record(self, db: Session, *, user_id: int) -> Optional[HealthRecord]:
        """
        获取用户最新的健康记录
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            
        Returns:
            最新的健康记录或None
        """
        return db.query(self.model).filter(
            self.model.user_id == user_id
        ).order_by(desc(self.model.assessed_at)).first()

    def count_records(
        self, 
        db: Session, 
        *, 
        user_id: int,
        assessment_type: Optional[AssessmentType] = None,
        data_source: Optional[DataSource] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> int:
        """
        统计健康记录数量
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            assessment_type: 评估类型筛选
            data_source: 数据来源筛选
            start_date: 开始日期
            end_date: 结束日期
            
        Returns:
            记录总数
        """
        query = db.query(func.count(self.model.id)).filter(self.model.user_id == user_id)
        
        # 添加筛选条件
        if assessment_type:
            query = query.filter(self.model.assessment_type == assessment_type)
        
        if data_source:
            query = query.filter(self.model.data_source == data_source)
        
        if start_date:
            query = query.filter(self.model.assessed_at >= start_date)
        
        if end_date:
            query = query.filter(self.model.assessed_at <= end_date)
        
        return query.scalar() or 0

    def batch_create(
        self, 
        db: Session, 
        *, 
        records_in: List[HealthRecordCreate], 
        user_id: int
    ) -> List[HealthRecord]:
        """
        批量创建健康记录
        
        Args:
            db: 数据库会话
            records_in: 记录创建数据列表
            user_id: 用户ID
            
        Returns:
            创建的健康记录列表
        """
        db_objs = []
        
        for record_in in records_in:
            health_level = self._calculate_health_level(record_in.overall_score)
            
            db_obj = HealthRecord(
                user_id=user_id,
                assessed_at=record_in.assessed_at,
                overall_score=record_in.overall_score,
                physical_score=record_in.physical_score,
                mental_score=record_in.mental_score,
                lifestyle_score=record_in.lifestyle_score,
                assessment_type=record_in.assessment_type,
                health_level=health_level,
                assessment_notes=record_in.assessment_notes,
                detailed_metrics=record_in.detailed_metrics,
                data_source=record_in.data_source
            )
            db_objs.append(db_obj)
        
        db.add_all(db_objs)
        db.commit()
        
        for obj in db_objs:
            db.refresh(obj)
        
        return db_objs

    def _calculate_health_level(self, score: float) -> HealthLevel:
        """
        根据评分计算健康等级
        
        Args:
            score: 健康评分 (0-100)
            
        Returns:
            健康等级
        """
        if score >= 80:
            return HealthLevel.EXCELLENT
        elif score >= 60:
            return HealthLevel.GOOD
        elif score >= 40:
            return HealthLevel.FAIR
        else:
            return HealthLevel.POOR

    def _calculate_time_range(
        self, 
        time_range: TimeRange, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> Tuple[datetime, datetime]:
        """
        计算查询时间范围
        
        Args:
            time_range: 预设时间范围
            start_date: 自定义开始时间
            end_date: 自定义结束时间
            
        Returns:
            (开始时间, 结束时间)
        """
        now = datetime.now()
        
        # 如果提供了自定义时间范围，优先使用
        if start_date and end_date:
            return start_date, end_date
        
        # 根据预设时间范围计算
        if time_range == TimeRange.WEEK:
            start = now - timedelta(days=7)
        elif time_range == TimeRange.MONTH:
            start = now - timedelta(days=30)
        elif time_range == TimeRange.QUARTER:
            start = now - timedelta(days=90)
        elif time_range == TimeRange.HALF_YEAR:
            start = now - timedelta(days=180)
        elif time_range == TimeRange.YEAR:
            start = now - timedelta(days=365)
        else:  # ALL
            start = datetime(2020, 1, 1)  # 假设系统从2020年开始
        
        return start, now

    def _calculate_summary(
        self, 
        db: Session, 
        user_id: int, 
        records: List[HealthRecord],
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        计算健康记录统计摘要
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            records: 健康记录列表
            start_date: 查询开始时间
            end_date: 查询结束时间
            
        Returns:
            统计摘要字典
        """
        if not records:
            return {
                "latest_score": None,
                "average_score": None,
                "max_score": None,
                "min_score": None,
                "score_trend": "stable",
                "total_assessments": 0,
                "assessment_frequency": 0.0,
                "health_level_distribution": {},
                "improvement_rate": None
            }
        
        # 基础统计
        scores = [r.overall_score for r in records]
        latest_score = records[-1].overall_score if records else None
        average_score = sum(scores) / len(scores)
        max_score = max(scores)
        min_score = min(scores)
        
        # 趋势分析 (比较首末两个记录)
        if len(records) >= 2:
            first_score = records[0].overall_score
            last_score = records[-1].overall_score
            if last_score > first_score + 5:
                score_trend = "rising"
            elif last_score < first_score - 5:
                score_trend = "falling"
            else:
                score_trend = "stable"
        else:
            score_trend = "stable"
        
        # 评估频率 (次/月)
        days_span = (end_date - start_date).days
        assessment_frequency = len(records) / max(days_span / 30, 1) if days_span > 0 else 0
        
        # 健康等级分布
        level_counts = {}
        for record in records:
            level = record.health_level
            level_counts[level] = level_counts.get(level, 0) + 1
        
        # 改善率 (如果有足够的数据)
        improvement_rate = None
        if len(records) >= 2:
            first_score = records[0].overall_score
            last_score = records[-1].overall_score
            improvement_rate = ((last_score - first_score) / first_score) * 100
        
        return {
            "latest_score": round(latest_score, 1) if latest_score else None,
            "average_score": round(average_score, 1),
            "max_score": round(max_score, 1),
            "min_score": round(min_score, 1),
            "score_trend": score_trend,
            "total_assessments": len(records),
            "assessment_frequency": round(assessment_frequency, 2),
            "health_level_distribution": level_counts,
            "improvement_rate": round(improvement_rate, 2) if improvement_rate else None
        }

    def _generate_echarts_config(
        self, 
        data_points: List[EChartsDataPoint], 
        summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        生成 ECharts 图表配置建议
        
        Args:
            data_points: 数据点列表
            summary: 统计摘要
            
        Returns:
            ECharts 配置字典
        """
        if not data_points:
            return {}
        
        # 基础配置
        config = {
            "title": {
                "text": "健康趋势分析",
                "subtext": f"共 {summary['total_assessments']} 次评估，平均分 {summary['average_score']}"
            },
            "tooltip": {
                "trigger": "axis",
                "formatter": "{b}<br/>综合评分: {c}<br/>健康等级: {d}"
            },
            "xAxis": {
                "type": "time",
                "name": "时间"
            },
            "yAxis": {
                "type": "value",
                "name": "健康评分",
                "min": 0,
                "max": 100
            },
            "series": [
                {
                    "name": "综合健康评分",
                    "type": "line",
                    "smooth": True,
                    "symbol": "circle",
                    "symbolSize": 6,
                    "lineStyle": {
                        "width": 2,
                        "color": self._get_trend_color(summary["score_trend"])
                    }
                }
            ],
            "grid": {
                "left": "3%",
                "right": "4%",
                "bottom": "3%",
                "top": "15%",
                "containLabel": True
            }
        }
        
        # 如果有分类评分数据，添加多系列配置
        if any(dp.physical is not None for dp in data_points):
            config["series"].extend([
                {
                    "name": "身体健康",
                    "type": "line",
                    "smooth": True,
                    "symbol": "triangle",
                    "symbolSize": 4
                },
                {
                    "name": "心理健康", 
                    "type": "line",
                    "smooth": True,
                    "symbol": "diamond",
                    "symbolSize": 4
                },
                {
                    "name": "生活方式",
                    "type": "line", 
                    "smooth": True,
                    "symbol": "square",
                    "symbolSize": 4
                }
            ])
            config["legend"] = {
                "data": ["综合健康评分", "身体健康", "心理健康", "生活方式"],
                "top": "5%"
            }
        
        return config

    def _get_trend_color(self, trend: str) -> str:
        """
        根据趋势获取颜色
        
        Args:
            trend: 趋势类型
            
        Returns:
            颜色值
        """
        colors = {
            "rising": "#52c41a",    # 绿色 - 上升
            "falling": "#ff4d4f",   # 红色 - 下降
            "stable": "#1890ff"     # 蓝色 - 稳定
        }
        return colors.get(trend, "#1890ff")


# 创建 CRUD 实例
health_record = CRUDHealthRecord(HealthRecord)
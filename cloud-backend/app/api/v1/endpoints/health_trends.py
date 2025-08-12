from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.schemas.health_record import (
    HealthRecord,
    HealthRecordCreate,
    HealthRecordUpdate,
    HealthRecordResponse,
    HealthRecordListResponse,
    HealthTrendsResponse,
    HealthTrendsQuery,
    HealthSummary,
    BatchHealthRecordCreate,
    BatchResponse,
    TimeRange,
    AssessmentType,
    DataSource,
    Message
)

router = APIRouter()


@router.get(
    "/{user_id}/health-trends",
    response_model=HealthTrendsResponse,
    summary="获取用户健康趋势数据",
    description="获取用户的健康趋势数据，适合 ECharts 图表展示"
)
def get_health_trends(
    user_id: int = Path(..., description="用户ID"),
    time_range: TimeRange = Query(TimeRange.MONTH, description="时间范围"),
    start_date: Optional[datetime] = Query(None, description="开始日期 (YYYY-MM-DD HH:MM:SS)"),
    end_date: Optional[datetime] = Query(None, description="结束日期 (YYYY-MM-DD HH:MM:SS)"),
    assessment_type: Optional[AssessmentType] = Query(None, description="评估类型筛选"),
    data_source: Optional[DataSource] = Query(None, description="数据来源筛选"),
    include_details: bool = Query(False, description="是否包含详细指标"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数限制"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    获取用户健康趋势数据
    
    支持的时间范围:
    - 7d: 最近7天
    - 30d: 最近30天  
    - 90d: 最近90天
    - 180d: 最近半年
    - 365d: 最近1年
    - all: 全部时间
    
    支持自定义时间范围 (start_date 和 end_date)
    支持按评估类型和数据来源筛选
    返回适合 ECharts 使用的数据格式
    """
    # 权限检查：只能查看自己的数据或管理员可以查看所有数据
    if current_user.id != user_id:
        # 这里可以添加管理员权限检查
        # if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="无权限访问其他用户的健康数据"
        )
    
    # 验证用户存在
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    # 验证日期范围
    if start_date and end_date and start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="开始日期必须早于结束日期"
        )
    
    try:
        # 获取 ECharts 格式的数据
        data_points, echarts_config = crud.health_record.get_echarts_data(
            db=db,
            user_id=user_id,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            assessment_type=assessment_type,
            data_source=data_source,
            limit=limit
        )
        
        # 获取统计摘要
        _, summary = crud.health_record.get_health_trends(
            db=db,
            user_id=user_id,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            assessment_type=assessment_type,
            data_source=data_source,
            limit=limit
        )
        
        # 构建时间范围描述
        if start_date and end_date:
            time_range_desc = f"{start_date.strftime('%Y-%m-%d')} 至 {end_date.strftime('%Y-%m-%d')}"
        else:
            time_range_map = {
                TimeRange.WEEK: "最近7天",
                TimeRange.MONTH: "最近30天", 
                TimeRange.QUARTER: "最近90天",
                TimeRange.HALF_YEAR: "最近半年",
                TimeRange.YEAR: "最近1年",
                TimeRange.ALL: "全部时间"
            }
            time_range_desc = time_range_map.get(time_range, "未知时间范围")
        
        return HealthTrendsResponse(
            data_points=data_points,
            summary=summary,
            time_range=time_range_desc,
            total_records=len(data_points),
            echarts_config=echarts_config
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取健康趋势数据失败: {str(e)}"
        )


@router.get(
    "/{user_id}/health-records",
    response_model=HealthRecordListResponse,
    summary="获取用户健康记录列表",
    description="分页获取用户的健康记录列表"
)
def get_health_records(
    user_id: int = Path(..., description="用户ID"),
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    assessment_type: Optional[AssessmentType] = Query(None, description="评估类型筛选"),
    data_source: Optional[DataSource] = Query(None, description="数据来源筛选"),
    start_date: Optional[datetime] = Query(None, description="开始日期"),
    end_date: Optional[datetime] = Query(None, description="结束日期"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """获取用户健康记录列表（支持分页和筛选）"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限访问其他用户的健康数据"
        )
    
    # 获取记录列表
    records = crud.health_record.get_multi(
        db=db,
        user_id=user_id,
        skip=skip,
        limit=limit,
        assessment_type=assessment_type,
        data_source=data_source,
        start_date=start_date,
        end_date=end_date
    )
    
    # 获取总记录数
    total = crud.health_record.count_records(
        db=db,
        user_id=user_id,
        assessment_type=assessment_type,
        data_source=data_source,
        start_date=start_date,
        end_date=end_date
    )
    
    return HealthRecordListResponse(
        items=records,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )


@router.get(
    "/{user_id}/health-records/{record_id}",
    response_model=HealthRecordResponse,
    summary="获取单个健康记录",
    description="根据记录ID获取用户的单个健康记录详情"
)
def get_health_record(
    user_id: int = Path(..., description="用户ID"),
    record_id: int = Path(..., description="健康记录ID"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """获取单个健康记录"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限访问其他用户的健康数据"
        )
    
    record = crud.health_record.get(db=db, record_id=record_id, user_id=user_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="健康记录不存在"
        )
    
    return HealthRecordResponse(
        data=record,
        message="获取健康记录成功"
    )


@router.post(
    "/{user_id}/health-records",
    response_model=HealthRecordResponse,
    status_code=201,
    summary="创建健康记录",
    description="为用户创建新的健康记录"
)
def create_health_record(
    user_id: int = Path(..., description="用户ID"),
    record_in: HealthRecordCreate = ...,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """创建健康记录"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限为其他用户创建健康记录"
        )
    
    # 验证用户存在
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    try:
        record = crud.health_record.create(
            db=db,
            obj_in=record_in,
            user_id=user_id
        )
        return HealthRecordResponse(
            data=record,
            message="创建健康记录成功"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"创建健康记录失败: {str(e)}"
        )


@router.put(
    "/{user_id}/health-records/{record_id}",
    response_model=HealthRecordResponse,
    summary="更新健康记录",
    description="更新用户的健康记录"
)
def update_health_record(
    user_id: int = Path(..., description="用户ID"),
    record_id: int = Path(..., description="健康记录ID"),
    record_in: HealthRecordUpdate = ...,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """更新健康记录"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限修改其他用户的健康记录"
        )
    
    record = crud.health_record.get(db=db, record_id=record_id, user_id=user_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="健康记录不存在"
        )
    
    try:
        updated_record = crud.health_record.update(
            db=db,
            db_obj=record,
            obj_in=record_in
        )
        return HealthRecordResponse(
            data=updated_record,
            message="更新健康记录成功"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"更新健康记录失败: {str(e)}"
        )


@router.delete(
    "/{user_id}/health-records/{record_id}",
    response_model=Message,
    summary="删除健康记录",
    description="删除用户的健康记录"
)
def delete_health_record(
    user_id: int = Path(..., description="用户ID"),
    record_id: int = Path(..., description="健康记录ID"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """删除健康记录"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限删除其他用户的健康记录"
        )
    
    record = crud.health_record.delete(db=db, record_id=record_id, user_id=user_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="健康记录不存在"
        )
    
    return Message(message="删除健康记录成功")


@router.get(
    "/{user_id}/health-summary",
    response_model=HealthSummary,
    summary="获取健康统计摘要",
    description="获取用户的健康统计摘要信息"
)
def get_health_summary(
    user_id: int = Path(..., description="用户ID"),
    time_range: TimeRange = Query(TimeRange.MONTH, description="统计时间范围"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """获取健康统计摘要"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限访问其他用户的健康数据"
        )
    
    try:
        _, summary = crud.health_record.get_health_trends(
            db=db,
            user_id=user_id,
            time_range=time_range
        )
        
        return HealthSummary(**summary)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取健康统计摘要失败: {str(e)}"
        )


@router.post(
    "/{user_id}/health-records/batch",
    response_model=BatchResponse,
    status_code=201,
    summary="批量创建健康记录",
    description="批量创建用户的健康记录（最多100条）"
)
def batch_create_health_records(
    user_id: int = Path(..., description="用户ID"),
    batch_in: BatchHealthRecordCreate = ...,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """批量创建健康记录"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限为其他用户创建健康记录"
        )
    
    # 验证用户存在
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    
    try:
        created_records = crud.health_record.batch_create(
            db=db,
            records_in=batch_in.records,
            user_id=user_id
        )
        
        return BatchResponse(
            success_count=len(created_records),
            failed_count=0,
            errors=[],
            created_ids=[record.id for record in created_records]
        )
        
    except Exception as e:
        return BatchResponse(
            success_count=0,
            failed_count=len(batch_in.records),
            errors=[f"批量创建失败: {str(e)}"],
            created_ids=[]
        )


@router.get(
    "/{user_id}/health-records/latest",
    response_model=HealthRecordResponse,
    summary="获取最新健康记录",
    description="获取用户最新的一条健康记录"
)
def get_latest_health_record(
    user_id: int = Path(..., description="用户ID"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """获取最新健康记录"""
    # 权限检查
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="无权限访问其他用户的健康数据"
        )
    
    record = crud.health_record.get_latest_record(db=db, user_id=user_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="暂无健康记录"
        )
    
    return HealthRecordResponse(
        data=record,
        message="获取最新健康记录成功"
    )
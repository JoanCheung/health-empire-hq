-- 简化版健康记录表创建脚本
-- 基于 SQLAlchemy 模型的精确 SQL 实现

CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    overall_score DOUBLE PRECISION NOT NULL,
    physical_score DOUBLE PRECISION,
    mental_score DOUBLE PRECISION,
    lifestyle_score DOUBLE PRECISION,
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive',
    health_level VARCHAR(20) NOT NULL,
    assessment_notes TEXT,
    detailed_metrics JSON,
    data_source VARCHAR(50) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 约束检查
    CONSTRAINT ck_overall_score_range CHECK (overall_score >= 0 AND overall_score <= 100),
    CONSTRAINT ck_physical_score_range CHECK (physical_score IS NULL OR (physical_score >= 0 AND physical_score <= 100)),
    CONSTRAINT ck_mental_score_range CHECK (mental_score IS NULL OR (mental_score >= 0 AND mental_score <= 100)),
    CONSTRAINT ck_lifestyle_score_range CHECK (lifestyle_score IS NULL OR (lifestyle_score >= 0 AND lifestyle_score <= 100))
);

-- 创建索引
CREATE INDEX ix_health_records_id ON health_records (id);
CREATE INDEX ix_health_records_user_id ON health_records (user_id);
CREATE INDEX ix_health_records_assessed_at ON health_records (assessed_at);
CREATE INDEX ix_health_records_overall_score ON health_records (overall_score);
CREATE INDEX ix_health_records_assessment_type ON health_records (assessment_type);
CREATE INDEX ix_health_records_user_date ON health_records (user_id, assessed_at);
CREATE INDEX ix_health_records_user_score ON health_records (user_id, overall_score);
CREATE INDEX ix_health_records_date_score ON health_records (assessed_at, overall_score);
CREATE INDEX ix_health_records_trends ON health_records (user_id, assessed_at, overall_score);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_records_updated_at 
    BEFORE UPDATE ON health_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
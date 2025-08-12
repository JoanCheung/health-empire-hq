-- 健康记录表创建 SQL 脚本
-- 用于 Health Empire HQ 健康趋势分析功能

-- 删除已存在的表和索引 (如果存在)
DROP TABLE IF EXISTS health_records CASCADE;

-- 创建健康记录表
CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    overall_score REAL NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    physical_score REAL CHECK (physical_score >= 0 AND physical_score <= 100),
    mental_score REAL CHECK (mental_score >= 0 AND mental_score <= 100),
    lifestyle_score REAL CHECK (lifestyle_score >= 0 AND lifestyle_score <= 100),
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive',
    health_level VARCHAR(20) NOT NULL,
    assessment_notes TEXT,
    detailed_metrics JSON,
    data_source VARCHAR(50) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX ix_health_records_id ON health_records (id);
CREATE INDEX ix_health_records_user_date ON health_records (user_id, assessed_at);
CREATE INDEX ix_health_records_user_score ON health_records (user_id, overall_score);
CREATE INDEX ix_health_records_assessment_type ON health_records (assessment_type);
CREATE INDEX ix_health_records_date_score ON health_records (assessed_at, overall_score);
CREATE INDEX ix_health_records_trends ON health_records (user_id, assessed_at, overall_score);

-- 创建更新时间的触发器
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

-- 插入示例健康数据 (假设用户ID为1存在)
INSERT INTO health_records (
    user_id, assessed_at, overall_score, physical_score, mental_score, lifestyle_score,
    assessment_type, health_level, assessment_notes, detailed_metrics, data_source
) VALUES 
-- 过去30天的健康记录，模拟改善趋势
(1, NOW() - INTERVAL '30 days', 65.5, 68.0, 60.0, 68.5, 'comprehensive', 'good', '初始健康评估', '{"bmi": 23.5, "blood_pressure": "120/80", "heart_rate": 72, "sleep_hours": 7.5, "exercise_minutes": 30, "stress_level": 6}', 'manual'),
(1, NOW() - INTERVAL '27 days', 67.2, 70.0, 62.5, 69.0, 'quick', 'good', '快速健康检查', '{"bmi": 23.4, "blood_pressure": "118/78", "heart_rate": 70, "sleep_hours": 7.8, "exercise_minutes": 45, "stress_level": 5}', 'device'),
(1, NOW() - INTERVAL '24 days', 69.8, 72.5, 65.0, 72.0, 'comprehensive', 'good', '健康状况有所改善', '{"bmi": 23.2, "blood_pressure": "115/75", "heart_rate": 68, "sleep_hours": 8.0, "exercise_minutes": 60, "stress_level": 4}', 'manual'),
(1, NOW() - INTERVAL '21 days', 71.0, 74.0, 67.5, 71.5, 'specific', 'good', '专项体能测试', '{"bmi": 23.0, "blood_pressure": "112/72", "heart_rate": 65, "sleep_hours": 8.2, "exercise_minutes": 75, "stress_level": 4}', 'api'),
(1, NOW() - INTERVAL '18 days', 73.5, 76.0, 70.0, 74.5, 'comprehensive', 'good', '健康改善明显', '{"bmi": 22.8, "blood_pressure": "110/70", "heart_rate": 63, "sleep_hours": 8.5, "exercise_minutes": 90, "stress_level": 3}', 'device'),
(1, NOW() - INTERVAL '15 days', 75.2, 78.5, 72.0, 75.0, 'quick', 'good', '持续改善中', '{"bmi": 22.6, "blood_pressure": "108/68", "heart_rate": 62, "sleep_hours": 8.8, "exercise_minutes": 95, "stress_level": 3}', 'manual'),
(1, NOW() - INTERVAL '12 days', 77.8, 80.0, 75.5, 78.0, 'comprehensive', 'good', '接近优秀水平', '{"bmi": 22.4, "blood_pressure": "105/65", "heart_rate": 60, "sleep_hours": 9.0, "exercise_minutes": 105, "stress_level": 2}', 'device'),
(1, NOW() - INTERVAL '9 days', 80.5, 82.5, 78.0, 81.0, 'specific', 'excellent', '达到优秀水平', '{"bmi": 22.2, "blood_pressure": "102/62", "heart_rate": 58, "sleep_hours": 9.2, "exercise_minutes": 120, "stress_level": 2}', 'api'),
(1, NOW() - INTERVAL '6 days', 82.0, 84.0, 80.5, 81.5, 'comprehensive', 'excellent', '健康状况优秀', '{"bmi": 22.0, "blood_pressure": "100/60", "heart_rate": 56, "sleep_hours": 9.5, "exercise_minutes": 125, "stress_level": 1}', 'device'),
(1, NOW() - INTERVAL '3 days', 83.5, 85.5, 82.0, 83.0, 'quick', 'excellent', '保持优秀状态', '{"bmi": 21.8, "blood_pressure": "98/58", "heart_rate": 55, "sleep_hours": 9.8, "exercise_minutes": 130, "stress_level": 1}', 'manual'),
(1, NOW() - INTERVAL '1 day', 85.0, 87.0, 83.5, 84.5, 'comprehensive', 'excellent', '健康水平持续优秀', '{"bmi": 21.6, "blood_pressure": "95/55", "heart_rate": 54, "sleep_hours": 10.0, "exercise_minutes": 135, "stress_level": 1}', 'device');

-- 为更多时间范围添加额外数据 (过去90天)
INSERT INTO health_records (
    user_id, assessed_at, overall_score, physical_score, mental_score, lifestyle_score,
    assessment_type, health_level, assessment_notes, detailed_metrics, data_source
) VALUES 
(1, NOW() - INTERVAL '60 days', 58.0, 60.0, 55.0, 59.0, 'comprehensive', 'fair', '早期健康评估', '{"bmi": 24.2, "blood_pressure": "130/85", "heart_rate": 78, "sleep_hours": 6.5, "exercise_minutes": 15, "stress_level": 8}', 'manual'),
(1, NOW() - INTERVAL '75 days', 55.5, 57.0, 52.0, 57.5, 'quick', 'fair', '健康意识启蒙', '{"bmi": 24.5, "blood_pressure": "135/88", "heart_rate": 80, "sleep_hours": 6.0, "exercise_minutes": 10, "stress_level": 9}', 'manual'),
(1, NOW() - INTERVAL '90 days', 52.0, 54.0, 48.0, 54.0, 'comprehensive', 'fair', '基线健康水平', '{"bmi": 25.0, "blood_pressure": "140/90", "heart_rate": 82, "sleep_hours": 5.5, "exercise_minutes": 5, "stress_level": 10}', 'manual');

-- 查询验证
SELECT 
    COUNT(*) as total_records,
    MIN(assessed_at) as earliest_record,
    MAX(assessed_at) as latest_record,
    AVG(overall_score) as avg_score
FROM health_records 
WHERE user_id = 1;
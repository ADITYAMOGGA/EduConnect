-- Create activity_logs table for tracking real user activities
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    activity VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON activity_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type ON activity_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity ON activity_logs(activity);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs
CREATE POLICY "Enable read access for organization members" ON activity_logs
    FOR SELECT USING (
        org_id IN (
            SELECT id FROM organizations WHERE id = org_id
        )
    );

CREATE POLICY "Enable insert for organization members" ON activity_logs
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT id FROM organizations WHERE id = org_id
        )
    );
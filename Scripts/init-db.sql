-- PostgreSQL Database Initialization Script for BY Application

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE by_development TO by_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO by_user;

-- Create development-specific settings
ALTER DATABASE by_development SET log_statement = 'all';
ALTER DATABASE by_development SET log_duration = on;

-- Insert some sample data for development (optional)
-- This will be executed only if the database is being initialized for the first time

-- Note: The actual table creation will be handled by Entity Framework migrations
-- This script is for initial database setup and configuration only

COMMENT ON DATABASE by_development IS 'BY Application Development Database';
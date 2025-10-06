-- Migration: Create website_page_versions table
-- Description: Creates the table for storing historical versions of website pages

CREATE TABLE IF NOT EXISTS website_page_versions (
    version_id SERIAL PRIMARY KEY,
    parent_page_id INTEGER NOT NULL REFERENCES website_pages(page_id) ON DELETE CASCADE,
    markdown_content TEXT NOT NULL,
    html_content TEXT,
    version INTEGER NOT NULL,
    creation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on parent_page_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_website_page_versions_parent ON website_page_versions(parent_page_id);

-- Create index on version for ordering
CREATE INDEX IF NOT EXISTS idx_website_page_versions_version ON website_page_versions(version);

-- Create unique constraint on parent_page_id and version
CREATE UNIQUE INDEX IF NOT EXISTS idx_website_page_versions_parent_version 
ON website_page_versions(parent_page_id, version);

-- Add comments for documentation
COMMENT ON TABLE website_page_versions IS 'Historical versions of website pages for content management';
COMMENT ON COLUMN website_page_versions.version_id IS 'Primary key for the version';
COMMENT ON COLUMN website_page_versions.parent_page_id IS 'Reference to the parent page';
COMMENT ON COLUMN website_page_versions.markdown_content IS 'Markdown content of this version';
COMMENT ON COLUMN website_page_versions.html_content IS 'Generated HTML content from markdown';
COMMENT ON COLUMN website_page_versions.version IS 'Version number of this content';
COMMENT ON COLUMN website_page_versions.creation_timestamp IS 'When this version was created';

-- Migration: Create website_pages table
-- Description: Creates the main table for website pages with content management

CREATE TABLE IF NOT EXISTS website_pages (
    page_id SERIAL PRIMARY KEY,
    page_slug VARCHAR(100) UNIQUE NOT NULL,
    page_title VARCHAR(255) NOT NULL,
    markdown_content TEXT NOT NULL,
    html_content TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    creation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on page_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_website_pages_slug ON website_pages(page_slug);

-- Create index on page_title for search functionality
CREATE INDEX IF NOT EXISTS idx_website_pages_title ON website_pages(page_title);

-- Create index on creation_timestamp for ordering
CREATE INDEX IF NOT EXISTS idx_website_pages_created ON website_pages(creation_timestamp);

-- Add comments for documentation
COMMENT ON TABLE website_pages IS 'Main table for website pages with content management';
COMMENT ON COLUMN website_pages.page_id IS 'Primary key for the page';
COMMENT ON COLUMN website_pages.page_slug IS 'URL-friendly identifier for the page';
COMMENT ON COLUMN website_pages.page_title IS 'Display title of the page';
COMMENT ON COLUMN website_pages.markdown_content IS 'Markdown content of the page';
COMMENT ON COLUMN website_pages.html_content IS 'Generated HTML content from markdown';
COMMENT ON COLUMN website_pages.version IS 'Current version number of the page';
COMMENT ON COLUMN website_pages.creation_timestamp IS 'When the page was first created';
COMMENT ON COLUMN website_pages.last_update_timestamp IS 'When the page was last updated';

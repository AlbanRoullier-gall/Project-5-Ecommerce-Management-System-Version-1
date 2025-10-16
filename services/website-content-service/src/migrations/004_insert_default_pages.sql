-- Migration: Insert default website content pages
-- Description: Seeds initial content pages so they can be managed from backoffice

-- Contact page
INSERT INTO website_pages (page_slug, page_title, markdown_content, version)
VALUES (
  'contact',
  'Contact',
  '# Contact\n\n## Adresse\nVotre adresse ici\n\n## Téléphone\n+33 1 23 45 67 89\n\n## Email\ncontact@naturedepierre.com\n\n## Horaires\nLun - Ven : 9h00 - 18h00\n\nSam : 9h00 - 12h00',
  1
)
ON CONFLICT (page_slug) DO NOTHING;

-- Mentions légales page
INSERT INTO website_pages (page_slug, page_title, markdown_content, version)
VALUES (
  'mentions-legales',
  'Mentions légales',
  '# Mentions légales\n\nContenu des mentions légales à compléter.',
  1
)
ON CONFLICT (page_slug) DO NOTHING;

-- Politique de confidentialité page
INSERT INTO website_pages (page_slug, page_title, markdown_content, version)
VALUES (
  'politique-de-confidentialite',
  'Politique de confidentialité',
  '# Politique de confidentialité\n\nContenu de la politique de confidentialité à compléter.',
  1
)
ON CONFLICT (page_slug) DO NOTHING;

-- Conditions générales page
INSERT INTO website_pages (page_slug, page_title, markdown_content, version)
VALUES (
  'conditions-generales',
  'Conditions générales',
  '# Conditions générales\n\nContenu des conditions générales à compléter.',
  1
)
ON CONFLICT (page_slug) DO NOTHING;

-- Philosophie page
INSERT INTO website_pages (page_slug, page_title, markdown_content, version)
VALUES (
  'philosophie',
  'Philosophie',
  '# PHILOSOPHIE\n\nVotre texte de philosophie ici.',
  1
)
ON CONFLICT (page_slug) DO NOTHING;



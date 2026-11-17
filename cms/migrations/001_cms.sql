CREATE SCHEMA IF NOT EXISTS cms;
REVOKE ALL ON SCHEMA cms FROM PUBLIC;

DO $$ BEGIN
  CREATE ROLE ivector_cms_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE ROLE ivector_cms_reader NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS cms.entries (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('home', 'about', 'researchArea', 'project', 'person', 'publication')),
  draft jsonb NOT NULL CHECK (jsonb_typeof(draft) = 'object'),
  published jsonb CHECK (published IS NULL OR jsonb_typeof(published) = 'object'),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 100000),
  published_order integer CHECK (published_order BETWEEN 0 AND 100000),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  source_note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind = 'home' AND id = 'home') OR (kind = 'about' AND id = 'about') OR
         (kind NOT IN ('home', 'about') AND id NOT IN ('home', 'about'))),
  CHECK ((published IS NULL) = (published_order IS NULL))
);

CREATE TABLE IF NOT EXISTS cms.assets (
  id text PRIMARY KEY,
  object_key text NOT NULL UNIQUE,
  mime text NOT NULL CHECK (mime = 'image/webp'),
  width integer NOT NULL CHECK (width BETWEEN 1 AND 4096),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 4096),
  size integer NOT NULL CHECK (size BETWEEN 1 AND 5242880),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW cms.published_entries WITH (security_barrier = true) AS
  SELECT id, kind, published AS fields, published_order AS "order"
  FROM cms.entries WHERE published IS NOT NULL;

CREATE OR REPLACE VIEW cms.published_assets WITH (security_barrier = true) AS
  SELECT id, object_key AS key, mime, width, height, size, sha256
  FROM cms.assets WHERE id IN (
    SELECT published ->> 'photoId' FROM cms.entries WHERE published IS NOT NULL
  );

REVOKE ALL ON ALL TABLES IN SCHEMA cms FROM PUBLIC;
GRANT USAGE ON SCHEMA cms TO ivector_cms_runtime, ivector_cms_reader;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms.entries, cms.assets TO ivector_cms_runtime;
GRANT SELECT ON cms.published_entries, cms.published_assets TO ivector_cms_reader;

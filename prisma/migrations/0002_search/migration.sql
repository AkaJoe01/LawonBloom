ALTER TABLE "Post" ADD COLUMN "searchTsv" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce("plainText",''))
  ) STORED;
CREATE INDEX "Post_searchTsv_idx" ON "Post" USING GIN ("searchTsv");
CREATE EXTENSION IF NOT EXISTS pg_trgm;

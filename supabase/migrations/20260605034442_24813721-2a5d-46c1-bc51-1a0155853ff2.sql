
ALTER TABLE public.absensi
  ADD COLUMN IF NOT EXISTS lat_masuk double precision,
  ADD COLUMN IF NOT EXISTS lng_masuk double precision,
  ADD COLUMN IF NOT EXISTS akurasi_masuk double precision,
  ADD COLUMN IF NOT EXISTS alamat_masuk text,
  ADD COLUMN IF NOT EXISTS lat_pulang double precision,
  ADD COLUMN IF NOT EXISTS lng_pulang double precision,
  ADD COLUMN IF NOT EXISTS akurasi_pulang double precision,
  ADD COLUMN IF NOT EXISTS alamat_pulang text;

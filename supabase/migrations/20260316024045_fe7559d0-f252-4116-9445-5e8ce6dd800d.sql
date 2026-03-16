
-- Create demo users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'pegawai@kitongbisa.org', crypt('123456', gen_salt('bf')), now(), '{"name":"Andi Pratama","jabatan":"Staff Administrasi","departemen":"Administrasi","role":"pegawai"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'admin@kitongbisa.org', crypt('123456', gen_salt('bf')), now(), '{"name":"Siti Rahayu","jabatan":"HR Manager","departemen":"Human Resources","role":"admin"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'pimpinan@kitongbisa.org', crypt('123456', gen_salt('bf')), now(), '{"name":"Budi Santoso","jabatan":"Direktur","departemen":"Manajemen","role":"pimpinan"}'::jsonb, 'authenticated', 'authenticated', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create identities for the users
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'pegawai@kitongbisa.org', 'email', '{"sub":"00000000-0000-0000-0000-000000000001","email":"pegawai@kitongbisa.org"}'::jsonb, now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'admin@kitongbisa.org', 'email', '{"sub":"00000000-0000-0000-0000-000000000002","email":"admin@kitongbisa.org"}'::jsonb, now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'pimpinan@kitongbisa.org', 'email', '{"sub":"00000000-0000-0000-0000-000000000003","email":"pimpinan@kitongbisa.org"}'::jsonb, now(), now(), now())
ON CONFLICT DO NOTHING;

-- Seed jadwal for all pegawai
INSERT INTO jadwal (pegawai_id, hari_kerja, jam_masuk, jam_pulang)
SELECT p.id, day, '08:00', '16:00'
FROM pegawai p
CROSS JOIN (VALUES ('Senin'), ('Selasa'), ('Rabu'), ('Kamis'), ('Jumat')) AS days(day)
ON CONFLICT DO NOTHING;

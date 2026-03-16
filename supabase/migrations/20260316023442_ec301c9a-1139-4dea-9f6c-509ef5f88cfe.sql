
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('pegawai', 'admin', 'pimpinan');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Pegawai table (matches class diagram)
CREATE TABLE public.pegawai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  departemen TEXT NOT NULL DEFAULT '',
  tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
  masa_kerja INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;

-- Jadwal table (matches class diagram)
CREATE TABLE public.jadwal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id UUID REFERENCES public.pegawai(id) ON DELETE CASCADE,
  jam_masuk TIME NOT NULL DEFAULT '08:00',
  jam_pulang TIME NOT NULL DEFAULT '16:00',
  hari_kerja TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jadwal ENABLE ROW LEVEL SECURITY;

-- Absensi table (matches class diagram)
CREATE TABLE public.absensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id UUID REFERENCES public.pegawai(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_masuk TIME,
  jam_pulang TIME,
  status TEXT NOT NULL DEFAULT 'belum',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pegawai_id, tanggal)
);
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;

-- Cuti table (matches class diagram)
CREATE TABLE public.cuti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id UUID REFERENCES public.pegawai(id) ON DELETE CASCADE NOT NULL,
  jumlah_hak INT NOT NULL DEFAULT 12,
  sisa_cuti INT NOT NULL DEFAULT 12,
  tahun INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  jenis TEXT,
  keterangan TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cuti ENABLE ROW LEVEL SECURITY;

-- Sanksi table (matches class diagram)
CREATE TABLE public.sanksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id UUID REFERENCES public.pegawai(id) ON DELETE CASCADE NOT NULL,
  jenis_sanksi TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan TEXT,
  diberikan_oleh UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sanksi ENABLE ROW LEVEL SECURITY;

-- Laporan table (matches class diagram)
CREATE TABLE public.laporan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode TEXT NOT NULL,
  tanggal_cetak DATE NOT NULL DEFAULT CURRENT_DATE,
  dibuat_oleh UUID REFERENCES auth.users(id),
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pegawai_updated_at BEFORE UPDATE ON public.pegawai FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_absensi_updated_at BEFORE UPDATE ON public.absensi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create pegawai profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pegawai (user_id, nama, jabatan, departemen)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'jabatan', 'Staff'),
    COALESCE(NEW.raw_user_meta_data->>'departemen', 'Umum')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'pegawai'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- user_roles: users can read their own role
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- pegawai: users can read own, admin/pimpinan can read all
CREATE POLICY "Users can read own pegawai" ON public.pegawai FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all pegawai" ON public.pegawai FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Pimpinan can read all pegawai" ON public.pegawai FOR SELECT USING (public.has_role(auth.uid(), 'pimpinan'));
CREATE POLICY "Admins can insert pegawai" ON public.pegawai FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pegawai" ON public.pegawai FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pegawai" ON public.pegawai FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- absensi: users can manage own, admin/pimpinan can read all
CREATE POLICY "Users can read own absensi" ON public.absensi FOR SELECT USING (
  pegawai_id IN (SELECT id FROM public.pegawai WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own absensi" ON public.absensi FOR INSERT WITH CHECK (
  pegawai_id IN (SELECT id FROM public.pegawai WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own absensi" ON public.absensi FOR UPDATE USING (
  pegawai_id IN (SELECT id FROM public.pegawai WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can read all absensi" ON public.absensi FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Pimpinan can read all absensi" ON public.absensi FOR SELECT USING (public.has_role(auth.uid(), 'pimpinan'));

-- jadwal: users can read own, admin can manage all
CREATE POLICY "Users can read own jadwal" ON public.jadwal FOR SELECT USING (
  pegawai_id IN (SELECT id FROM public.pegawai WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage jadwal" ON public.jadwal FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Pimpinan can read jadwal" ON public.jadwal FOR SELECT USING (public.has_role(auth.uid(), 'pimpinan'));

-- cuti: users can read own, admin can manage all
CREATE POLICY "Users can read own cuti" ON public.cuti FOR SELECT USING (
  pegawai_id IN (SELECT id FROM public.pegawai WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own cuti" ON public.cuti FOR INSERT WITH CHECK (
  pegawai_id IN (SELECT id FROM public.pegawai WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage cuti" ON public.cuti FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- sanksi: admin can manage, users can read own
CREATE POLICY "Users can read own sanksi" ON public.sanksi FOR SELECT USING (
  pegawai_id IN (SELECT id FROM public.pegawai WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage sanksi" ON public.sanksi FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Pimpinan can read sanksi" ON public.sanksi FOR SELECT USING (public.has_role(auth.uid(), 'pimpinan'));

-- laporan: admin and pimpinan can manage
CREATE POLICY "Admins can manage laporan" ON public.laporan FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Pimpinan can read laporan" ON public.laporan FOR SELECT USING (public.has_role(auth.uid(), 'pimpinan'));

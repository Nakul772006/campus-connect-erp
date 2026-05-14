
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('student', 'faculty');
CREATE TYPE public.exam_type AS ENUM ('internal_1', 'internal_2', 'midterm', 'final', 'assignment');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE public.fee_status AS ENUM ('paid', 'pending', 'overdue', 'partial');
CREATE TYPE public.notice_audience AS ENUM ('all', 'students', 'faculty');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============ STUDENTS ============
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL UNIQUE,
  branch TEXT NOT NULL,
  year INT NOT NULL CHECK (year BETWEEN 1 AND 5),
  section TEXT,
  semester INT NOT NULL DEFAULT 1,
  admission_year INT,
  date_of_birth DATE,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ============ FACULTY ============
CREATE TABLE public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  designation TEXT,
  joined_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- ============ SUBJECTS ============
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester INT NOT NULL,
  credits INT DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- ============ MARKS ============
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_type public.exam_type NOT NULL,
  marks_obtained NUMERIC(5,2) NOT NULL,
  max_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, exam_type)
);
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status public.attendance_status NOT NULL DEFAULT 'present',
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- ============ NOTICES ============
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience public.notice_audience NOT NULL DEFAULT 'all',
  branch TEXT,
  year INT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- ============ FEES ============
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  semester INT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.fee_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  transaction_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- ============ TIMETABLE ============
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch TEXT NOT NULL,
  year INT NOT NULL,
  section TEXT,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period INT NOT NULL CHECK (period BETWEEN 1 AND 10),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch, year, section, day_of_week, period)
);
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles: everyone authenticated can read; user updates own
CREATE POLICY "profiles read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- user_roles: user reads own; faculty reads all; only DB trigger inserts
CREATE POLICY "roles read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'faculty'));

-- students: student sees own; faculty sees all; faculty manages
CREATE POLICY "students read own or faculty" ON public.students FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'faculty'));
CREATE POLICY "students insert own on signup" ON public.students FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'faculty'));
CREATE POLICY "students update own or faculty" ON public.students FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'faculty'));
CREATE POLICY "students delete faculty" ON public.students FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'faculty'));

-- faculty
CREATE POLICY "faculty read" ON public.faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "faculty insert own" ON public.faculty FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "faculty update own" ON public.faculty FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- subjects: read all; faculty manages
CREATE POLICY "subjects read" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "subjects faculty manage" ON public.subjects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')) WITH CHECK (public.has_role(auth.uid(), 'faculty'));

-- marks: student reads own, faculty manages
CREATE POLICY "marks read own or faculty" ON public.marks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));
CREATE POLICY "marks faculty manage" ON public.marks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')) WITH CHECK (public.has_role(auth.uid(), 'faculty'));

-- attendance: student reads own, faculty manages
CREATE POLICY "attendance read own or faculty" ON public.attendance FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));
CREATE POLICY "attendance faculty manage" ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')) WITH CHECK (public.has_role(auth.uid(), 'faculty'));

-- notices: everyone reads; faculty manages
CREATE POLICY "notices read" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "notices faculty manage" ON public.notices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')) WITH CHECK (public.has_role(auth.uid(), 'faculty'));

-- fees: student reads own, faculty manages
CREATE POLICY "fees read own or faculty" ON public.fees FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));
CREATE POLICY "fees faculty manage" ON public.fees FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')) WITH CHECK (public.has_role(auth.uid(), 'faculty'));

-- timetable: everyone reads; faculty manages
CREATE POLICY "timetable read" ON public.timetable FOR SELECT TO authenticated USING (true);
CREATE POLICY "timetable faculty manage" ON public.timetable FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'faculty')) WITH CHECK (public.has_role(auth.uid(), 'faculty'));

-- ============ TRIGGERS ============

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER notices_touch BEFORE UPDATE ON public.notices
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ STORAGE: avatars bucket ============
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "avatars user upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars user update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars user delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

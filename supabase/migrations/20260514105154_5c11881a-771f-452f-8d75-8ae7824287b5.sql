
-- Allow user to insert their own role exactly once during signup
CREATE POLICY "user assigns own role on signup" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
  );

-- Seed subjects (CSE Sem 1)
INSERT INTO public.subjects (code, name, branch, semester, credits) VALUES
  ('CS101', 'Introduction to Programming', 'CSE', 1, 4),
  ('MA101', 'Engineering Mathematics I', 'CSE', 1, 4),
  ('PH101', 'Engineering Physics', 'CSE', 1, 3),
  ('EN101', 'Communicative English', 'CSE', 1, 2),
  ('CS102', 'Digital Logic Design', 'CSE', 1, 3)
ON CONFLICT (code) DO NOTHING;

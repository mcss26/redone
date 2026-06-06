ALTER TABLE public.fixed_cost_templates DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.fixed_cost_templates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.fixed_cost_templates;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.fixed_cost_templates;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.fixed_cost_templates;

-- Remove policy that allows users to view tasks they created
DROP POLICY IF EXISTS "Users can view tasks they created" ON public.tasks;

-- Verify that only these policies remain:
-- 1. Admins can insert tasks (already exists)
-- 2. Admins can view all tasks (already exists)
-- 3. Admins can update all tasks (already exists)
-- 4. Admins can delete tasks (already exists)
-- 5. Users can view their assigned tasks (already exists)
-- 6. Users can update their assigned tasks status (already exists)
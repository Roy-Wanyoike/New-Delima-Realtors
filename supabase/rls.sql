-- ============================================================================
-- Delima Realtors — Row Level Security policies
-- ----------------------------------------------------------------------------
-- Apply with:  psql "$DATABASE_URL" -f supabase/rls.sql
-- Run AFTER schema.sql.
-- ----------------------------------------------------------------------------
-- Threat model:
--   * The Supabase anon key is public (shipped to the browser).
--   * Anyone on the internet can therefore query the DB as role `anon`.
--   * RLS is the ONLY thing preventing anon from reading/writing everything.
-- ============================================================================

-- Enable RLS ---------------------------------------------------------------
alter table public.projects  enable row level security;
alter table public.contacts  enable row level security;
alter table public.admins   enable row level security;

-- Helper: is the current user an admin? ------------------------------------
-- Returns true if auth.uid() has a row in public.admins.
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
    select exists (
        select 1 from public.admins where user_id = auth.uid()
    );
$$;

-- ---------------------------------------------------------------------------
-- projects
--   * anon / public:  SELECT only published listings.
--   * admin:          full CRUD.
-- ---------------------------------------------------------------------------
drop policy if exists "projects: public read published" on public.projects;
create policy "projects: public read published"
    on public.projects for select to anon, authenticated
    using (status = 'published');

drop policy if exists "projects: admin write all" on public.projects;
create policy "projects: admin write all"
    on public.projects for all to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- contacts
--   * anon / public:  INSERT only (submit a lead). CANNOT read (PII).
--   * admin:          SELECT / UPDATE / DELETE.
-- ---------------------------------------------------------------------------
drop policy if exists "contacts: public insert" on public.contacts;
create policy "contacts: public insert"
    on public.contacts for insert to anon, authenticated
    with check (true);

drop policy if exists "contacts: admin read" on public.contacts;
create policy "contacts: admin read"
    on public.contacts for select to authenticated
    using (public.is_admin());

drop policy if exists "contacts: admin update" on public.contacts;
create policy "contacts: admin update"
    on public.contacts for update to authenticated
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "contacts: admin delete" on public.contacts;
create policy "contacts: admin delete"
    on public.contacts for delete to authenticated
    using (public.is_admin());

-- ---------------------------------------------------------------------------
-- admins (self-referential: only admins can manage the admin allowlist)
--   * a user may read their own row (for the is_admin check to work
--     via the security-definer function, this table select isn't strictly
--     needed by the client, but we allow self-read for transparency).
--   * admin: full CRUD.
-- ---------------------------------------------------------------------------
drop policy if exists "admins: self read" on public.admins;
create policy "admins: self read"
    on public.admins for select to authenticated
    using (user_id = auth.uid());

drop policy if exists "admins: admin manage" on public.admins;
create policy "admins: admin manage"
    on public.admins for all to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: project-images bucket
--   * public read (listings display images).
--   * admin write (only admins upload new property photos).
-- ---------------------------------------------------------------------------
-- NOTE: Supabase Storage policies are managed via the Storage API or
-- Dashboard. Equivalent SQL for reference:
--
-- create policy "project-images: public read"
--   on storage.objects for select to anon, authenticated
--   using (bucket_id = 'project-images');
--
-- create policy "project-images: admin write"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'project-images' and public.is_admin());
--
-- Apply these in the Supabase Dashboard under Storage → Policies.

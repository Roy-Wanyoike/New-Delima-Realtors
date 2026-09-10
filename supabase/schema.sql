-- ============================================================================
-- Delima Realtors — Database schema
-- ----------------------------------------------------------------------------
-- Apply with:  psql "$DATABASE_URL" -f supabase/schema.sql
-- Requires:    Supabase project (auth.users is managed by Supabase Auth).
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- projects: property listings managed by admins.
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
    id          uuid primary key default gen_random_uuid(),
    title       text        not null,
    description text        not null,
    location    text        not null,
    price       text        not null,                 -- stored as text to preserve formatting (e.g. '17700000')
    bedrooms    text,
    bathrooms   text,
    image_url   text,
    category    text        not null default 'Residential',
    status      text        not null default 'published'
                  check (status in ('published', 'draft', 'sold')),
    featured    boolean      not null default false,
    amenities   text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists projects_status_created_at_idx
    on public.projects (status, created_at desc);
create index if not exists projects_featured_idx
    on public.projects (featured desc) where status = 'published';
create index if not exists projects_category_idx
    on public.projects (category);

-- ---------------------------------------------------------------------------
-- contacts: customer inquiries submitted from the public site.
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
    id            uuid primary key default gen_random_uuid(),
    name          text        not null,
    email         text        not null,
    phone         text,
    subject       text,
    message       text        not null,
    property_id   uuid references public.projects(id) on delete set null,
    interested_in text,
    status        text        not null default 'new'
                    check (status in ('new', 'contacted', 'closed')),
    created_at    timestamptz not null default now()
);

create index if not exists contacts_status_created_at_idx
    on public.contacts (status, created_at desc);
create index if not exists contacts_email_idx
    on public.contacts (email);

-- ---------------------------------------------------------------------------
-- admins: allowlist of auth.users who may access the admin dashboard.
-- A row here is created for each authorized admin; RLS checks membership.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
    user_id    uuid primary key references auth.users(id) on delete cascade,
    email      text not null,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger for projects.
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
    before update on public.projects
    for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage bucket for property images (public read, admin-only write).
-- NOTE: bucket policies are configured in the Supabase Dashboard or via the
-- Storage API; see README "Database" section.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- instagram_posts: social feed posts synced from Instagram (or manually added).
-- ---------------------------------------------------------------------------
create table if not exists public.instagram_posts (
    id            uuid primary key default gen_random_uuid(),
    instagram_id  text        not null unique,            -- IG media ID or 'manual-<timestamp>'
    caption       text        not null default '',
    media_url     text        not null,                   -- image URL (Supabase Storage or IG CDN)
    permalink     text        not null default '',        -- link back to the IG post
    posted_at     timestamptz not null default now(),     -- when IG posted it
    tags          text[]      not null default '{}',      -- hashtags extracted from caption
    created_at    timestamptz not null default now()
);

create index if not exists instagram_posts_posted_at_idx
    on public.instagram_posts (posted_at desc);

-- ---------------------------------------------------------------------------
-- valuations: seller valuation requests from the /valuation wizard.
-- ---------------------------------------------------------------------------
create table if not exists public.valuations (
    id              uuid primary key default gen_random_uuid(),
    name            text        not null,
    email           text        not null,
    phone           text        not null,
    property_type   text,
    bedrooms        text,
    bathrooms       text,
    size            text,
    location        text        not null,
    neighborhood    text,
    condition       text        not null default 'good'
                      check (condition in ('excellent', 'good', 'fair', 'poor')),
    notes           text,
    status          text        not null default 'new'
                      check (status in ('new', 'reviewing', 'contacted', 'closed')),
    created_at      timestamptz not null default now()
);

create index if not exists valuations_status_created_at_idx
    on public.valuations (status, created_at desc);

-- ---------------------------------------------------------------------------
-- newsletter_subscribers: email capture from the homepage newsletter form.
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
    id          uuid primary key default gen_random_uuid(),
    email       text        not null unique,
    created_at  timestamptz not null default now()
);

create index if not exists newsletter_subscribers_email_idx
    on public.newsletter_subscribers (email);

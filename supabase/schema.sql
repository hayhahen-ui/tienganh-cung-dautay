-- ═══════════════════════════════════════════════════════════════════════════
-- Owly English — Schema Supabase (bản thương mại, 20/10/2026)
-- Chạy 1 lần trong Supabase Dashboard → SQL Editor → New query → Run.
-- Dự án: Supabase mới dành riêng cho Owly (KHÔNG dùng chung project ESG/MT5).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Hồ sơ tài khoản: 1 dòng / 1 auth user. role: 'admin' | 'user'.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  kid_name text,                       -- tên bé học (user tự đổi được)
  created_at timestamptz not null default now()
);

-- 2. Tiến độ học: 1 dòng / 1 user, data = toàn bộ ProgressState (JSON).
create table if not exists public.progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3. RLS
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

-- Hàm kiểm tra admin (SECURITY DEFINER để tránh đệ quy RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: user đọc/sửa hồ sơ của mình; admin làm mọi thứ.
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- progress: user đọc/ghi tiến độ của mình; admin đọc tất cả.
drop policy if exists "progress_own" on public.progress;
create policy "progress_own" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "progress_admin_read" on public.progress;
create policy "progress_admin_read" on public.progress
  for select using (public.is_admin());

-- 4. Index
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_idx on public.profiles (created_at desc);

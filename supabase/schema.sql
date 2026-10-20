-- ═══════════════════════════════════════════════════════════════════════════
-- Owly English — Schema Supabase (bản thương mại, 20/10/2026)
-- Chạy trong Supabase Dashboard → SQL Editor → New query → Run.
-- BẢNG DÙNG TIỀN TỐ owly_ để cách ly hoàn toàn với các app khác
-- (QuetDoc…) trong cùng project — free plan không tạo thêm project được.
-- QuetDoc chỉ dùng bảng: directives, master_orders, packing_ranges, records —
-- SQL này KHÔNG CHẠM tới chúng.
-- ═══════════════════════════════════════════════════════════════════════════

-- 0. Dọn 2 bảng + function của bản schema cũ (20/10 buổi sáng) —
--    CHỈ xóa khi TRỐNG và ĐÚNG cột của Owly (kid_name), tránh đụng app khác.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'kid_name'
  ) and (select count(*) from public.profiles) = 0 then
    drop table public.profiles;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'progress'
      and column_name = 'user_id'
  ) and (select count(*) from public.progress) = 0 then
    drop table public.progress;
  end if;
end $$;

drop function if exists public.is_admin();

-- 1. Hồ sơ tài khoản: 1 dòng / 1 auth user. role: 'admin' | 'user'.
create table if not exists public.owly_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  kid_name text,                       -- tên bé học (user tự đổi được)
  created_at timestamptz not null default now()
);

-- 2. Tiến độ học: 1 dòng / 1 user, data = toàn bộ ProgressState (JSON).
create table if not exists public.owly_progress (
  user_id uuid primary key references public.owly_profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3. RLS
alter table public.owly_profiles enable row level security;
alter table public.owly_progress enable row level security;

-- Hàm kiểm tra admin (SECURITY DEFINER để tránh đệ quy RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.owly_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- owly_profiles: user đọc/sửa hồ sơ của mình; admin làm mọi thứ.
drop policy if exists "profiles_own" on public.owly_profiles;
create policy "profiles_own" on public.owly_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.owly_profiles;
create policy "profiles_admin_all" on public.owly_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- owly_progress: user đọc/ghi tiến độ của mình; admin đọc tất cả.
drop policy if exists "progress_own" on public.owly_progress;
create policy "progress_own" on public.owly_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "progress_admin_read" on public.owly_progress;
create policy "progress_admin_read" on public.owly_progress
  for select using (public.is_admin());

-- 4. Index
create index if not exists owly_profiles_role_idx on public.owly_profiles (role);
create index if not exists owly_profiles_created_idx on public.owly_profiles (created_at desc);

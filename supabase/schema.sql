-- ═══════════════════════════════════════════════════════════════════════════
-- Owly English — KHÔI PHỤC QuetDoc + TẠO BẢNG OWLY RIÊNG (20/10/2026)
-- Chạy 1 lần trong Supabase Dashboard → SQL Editor → Run.
-- Bối cảnh: project này là DB production của QuetDoc (directives, master_orders,
-- packing_ranges, records, profiles). Script khôi phục mọi thứ về nguyên trạng
-- QuetDoc, rồi tạo bảng Owly với tiền tố owly_ — KHÔNG CHẠM dữ liệu QuetDoc.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Trả is_admin() về ĐÚNG bản gốc của QuetDoc
--    (nguồn: quetdoc-Qrcode/docs/supabase-setup.sql dòng 30)
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 2. Gỡ 2 policy thừa của Owly trên bảng profiles của QuetDoc
drop policy if exists "profiles_own" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;

-- 3. Gỡ 2 index thừa của Owly trên bảng profiles của QuetDoc
drop index if exists public.profiles_role_idx;
drop index if exists public.profiles_created_idx;

-- 4. Bảng "progress": nếu là của Owly (trống + có cột data jsonb) → xóa.
--    Nếu có dữ liệu (không phải của Owly) → giữ nguyên, không đụng.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'progress'
  ) and (select count(*) from public.progress) = 0
     and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'progress'
      and column_name = 'data'
  ) then
    drop table public.progress;
  end if;
end $$;

-- 5. Bảng riêng cho Owly (tiền tố owly_ — không đụng QuetDoc)
create table if not exists public.owly_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  kid_name text,                       -- tên bé học (user tự đổi được)
  created_at timestamptz not null default now()
);

create table if not exists public.owly_progress (
  user_id uuid primary key references public.owly_profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 6. RLS cho bảng Owly (hàm check riêng — không dùng is_admin của QuetDoc)
alter table public.owly_profiles enable row level security;
alter table public.owly_progress enable row level security;

create or replace function public.owly_is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.owly_profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "owly_profiles_own" on public.owly_profiles;
create policy "owly_profiles_own" on public.owly_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "owly_profiles_admin_all" on public.owly_profiles;
create policy "owly_profiles_admin_all" on public.owly_profiles
  for all using (public.owly_is_admin()) with check (public.owly_is_admin());

drop policy if exists "owly_progress_own" on public.owly_progress;
create policy "owly_progress_own" on public.owly_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "owly_progress_admin_read" on public.owly_progress;
create policy "owly_progress_admin_read" on public.owly_progress
  for select using (public.owly_is_admin());

create index if not exists owly_profiles_role_idx on public.owly_profiles (role);
create index if not exists owly_profiles_created_idx on public.owly_profiles (created_at desc);

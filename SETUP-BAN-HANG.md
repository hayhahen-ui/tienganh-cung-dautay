# BÁN HÀNG: Tài khoản, phân quyền & tiến độ theo user (20/10/2026)

## Mô hình quyền

| Ai | Được làm gì |
|---|---|
| **Khách (chưa đăng nhập)** | Xem trang chủ + **tiêu đề** các trang khác. Nội dung bị khóa 🔒 — đăng nhập mới mở. |
| **User (học viên)** | Học đầy đủ mọi nội dung; tiến độ học **lưu riêng theo tài khoản** (đổi thiết bị vẫn thấy); tự **đổi mật khẩu của mình**; tự **đổi tên bé học**; xem trang Tài khoản của mình. KHÔNG xem được dữ liệu của user khác, KHÔNG vào được trang Admin. |
| **Admin** | Làm được **mọi thứ của user** + trang **/admin**: xem danh sách user, tạo user mới, **xóa user** (tiến độ mất theo), **đặt lại mật khẩu** bất kỳ user nào, sửa tên bé của user, xem tiến độ học từng user. |

## Anh cần làm 7 bước (khoảng 15 phút)

### Bước 1 — Tạo project Supabase mới
- Vào [supabase.com](https://supabase.com) → **New project** (gói free).
- Đặt tên ví dụ `owly-english-shop`. **Đừng dùng chung project với ESG/MT5.**
- Đợi project khởi tạo xong (~2 phút).

### Bước 2 — Chạy SQL tạo bảng
- Trong Supabase Dashboard → **SQL Editor** → **New query**.
- Mở file `supabase/schema.sql` trong repo, **copy toàn bộ**, dán vào, bấm **Run**.
- Kết quả: 2 bảng `profiles`, `progress` + chính sách bảo mật (RLS).

### Bước 3 — Lấy 3 chìa khóa
- Supabase Dashboard → **Project Settings** → **API**:
  - `Project URL` → dùng cho `SUPABASE_URL` / `VITE_SUPABASE_URL`
  - `anon public` key → dùng cho `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
  - `service_role` key → dùng cho `SUPABASE_SERVICE_ROLE_KEY` (**giữ bí mật tuyệt đối**)

### Bước 4 — Đặt biến môi trường trên Render (frontend)
- Render Dashboard → site `tienganh-cung-dautay` → **Environment** → thêm:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Xong bấm **Clear build cache & deploy** (để nhận biến mới).

### Bước 5 — Đặt biến môi trường trên Vercel (API)
- Vercel Dashboard → project `tienganh-cung-dautay` → **Settings** → **Environment Variables** → thêm:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ không bao giờ có tiền tố `VITE_`)
  - `OWLY_SETUP_TOKEN` — tự bịa 1 chuỗi dài, vd `owly-setup-9xK2mQ7...` (khóa trang /setup)
- Xong bấm **Redeploy**.

### Bước 6 — Tạo admin + 5 user (chạy 1 lần duy nhất)
- Mở `https://app.mrbitbet90.tech/setup`
- Nhập: mã setup (OWLY_SETUP_TOKEN vừa đặt), email + mật khẩu **admin** (tự chọn),
  sửa 5 email/tên bé mặc định nếu muốn.
- Bấm **🚀 Tạo admin + 5 user** → màn hình hiện **mật khẩu tạm của 5 user — CHỈ HIỆN 1 LẦN**.
  **Lưu lại ngay** (chép vào sổ/file), rồi bàn giao cho học viên và nhắc họ đổi mật khẩu.
- Sau bước này trang /setup tự khóa vĩnh viễn.

### Bước 7 — Kiểm tra
- Đăng nhập admin → menu có nút **🛠️** → trang Quản trị: thử xem tiến độ, đổi mật khẩu 1 user.
- Mở tab ẩn danh (chưa đăng nhập) → bấm "Bài học": chỉ thấy tiêu đề + ổ khóa 🔒.
- Đăng nhập 1 user → học 1 bài → kiểm tra XP lưu; đăng nhập trên máy khác → XP theo sang.

## Bán hàng về sau
- Có học viên mới: admin đăng nhập → **/admin** → **➕ Tạo tài khoản mới** → nhập email học viên
  → lấy mật khẩu tạm hiện 1 lần → gửi cho phụ huynh → họ đăng nhập và tự đổi mật khẩu ở
  trang **Tài khoản**.
- Không có chuyện "đăng ký tự do": chỉ admin tạo tài khoản → đúng mô hình bán.

## Ghi chú kỹ thuật
- Tiến độ học: bảng `owly_progress`, 1 dòng/user, đồng bộ cloud ↔ máy (debounce 6s, bản mới hơn thắng).
- Mọi thao tác nguy hiểm (tạo/xóa/đổi mật khẩu user khác) chạy qua `api/admin-users.js`
  bằng `service_role` ở phía server — frontend không bao giờ chạm vào key này.
- Nếu chưa cấu hình Supabase, app chạy mở như cũ + banner cảnh báo (để không "chết" khi build thiếu env).

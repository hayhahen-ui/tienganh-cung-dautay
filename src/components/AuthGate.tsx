import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

/** Trang public: khách thấy được mà không cần đăng nhập. */
const PUBLIC_PATHS = new Set(["/", "/dang-nhap", "/setup"]);

const TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: "/bai-hoc", title: "📚 Bài học" },
  { prefix: "/on-tap", title: "🧠 Ôn tập" },
  { prefix: "/hoi-dap", title: "💬 Hỏi cô Owly" },
  { prefix: "/lo-trinh", title: "Lộ trình" },
  { prefix: "/giao-trinh", title: "Giáo trình" },
  { prefix: "/ba-me", title: "Góc ba mẹ" },
  { prefix: "/tien-do", title: "📊 Tiến độ học tập" },
  { prefix: "/kiem-tra", title: "📝 Kiểm tra" },
  { prefix: "/tai-khoan", title: "👤 Tài khoản" },
  { prefix: "/admin", title: "🛠️ Quản trị" },
];

function titleFor(pathname: string): string {
  for (const t of TITLES) {
    if (pathname === t.prefix || pathname.startsWith(t.prefix + "/")) return t.title;
  }
  return "Nội dung học tập";
}

/**
 * Cổng đăng nhập (bản thương mại):
 * - Chưa cấu hình Supabase → app chạy mở như cũ (kèm banner cảnh báo).
 * - Khách (chưa đăng nhập): chỉ thấy TRANG CHỦ + TIÊU ĐỀ các trang khác,
 *   nội dung bị khóa; đăng nhập mới mở.
 * - /admin: chỉ admin.
 */
export function AuthGate() {
  const auth = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!auth.configured) {
    return (
      <>
        <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-bold text-amber-900">
          ⚠️ Chưa cấu hình đăng nhập (Supabase) — mọi nội dung đang mở công khai. Chủ shop cần bật
          theo hướng dẫn để bán hàng.
        </div>
        <Outlet />
      </>
    );
  }

  if (auth.loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-muted-foreground">Đang tải…</div>
    );
  }

  const isPublic = PUBLIC_PATHS.has(pathname);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isPublic) return <Outlet />;
  if (isAdminRoute && auth.profile?.role === "admin") return <Outlet />;
  if (isAdminRoute) {
    return (
      <LockedPage
        title="🛠️ Quản trị"
        text="Khu vực chỉ dành cho quản trị viên."
        showLogin={!auth.session}
      />
    );
  }
  if (auth.session) return <Outlet />;
  return (
    <LockedPage
      title={titleFor(pathname)}
      text="Nội dung học tập dành cho học viên đã đăng nhập. Đăng nhập để mở khóa toàn bộ bài học, cô Owly AI và lưu tiến độ học của bé."
      showLogin
    />
  );
}

export function LockedPage({
  title,
  text,
  showLogin = true,
}: {
  title: string;
  text: string;
  showLogin?: boolean;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border-2 border-border bg-card p-8 text-center shadow-pop">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <div className="my-4 text-6xl" aria-hidden>
          🔒
        </div>
        <p className="text-sm text-muted-foreground">{text}</p>
        <div className="mt-6 flex flex-col gap-2">
          {showLogin && (
            <Link
              to="/dang-nhap"
              className="rounded-full bg-primary px-6 py-3 font-display text-base font-bold text-primary-foreground"
            >
              🔑 Đăng nhập để mở khóa
            </Link>
          )}
          <Link
            to="/"
            className="rounded-full border-2 border-border px-6 py-2.5 text-sm font-bold hover:bg-muted"
          >
            🏠 Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

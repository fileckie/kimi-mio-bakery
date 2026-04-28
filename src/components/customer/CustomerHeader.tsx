import { useEffect } from "react";
import { Menu, X, Flame, ShoppingBag, User } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useCartStore } from "../../stores/cartStore";
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../../stores/authStore";

const navItems = [
  { label: "今日出炉", href: "#today" },
  { label: "面包单", href: "#menu" },
  { label: "查订单", href: "#order-lookup" },
  { label: "门店", href: "#stores" },
];

export function CustomerHeader({ onOpenMyOrders }: { onOpenMyOrders?: () => void }) {
  const { mobileMenuOpen, setMobileMenuOpen, scrolled, setScrolled } = useUIStore();
  const navigate = useAppStore((s) => s.setRoute);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const customer = useAuthStore((s) => s.customer);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setScrolled]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ash/95 backdrop-blur-xl border-b border-border shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5" aria-label="Mio SLOWFIRE 首页">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kiln text-ash">
            <Flame className="h-4 w-4" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-kiln">Mio</span>
            <span className="font-script text-[11px] tracking-wider text-smoke">slowfire</span>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-smoke lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="elegant-link transition hover:text-kiln">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {customer && onOpenMyOrders && (
            <button
              onClick={onOpenMyOrders}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-kiln transition hover:bg-surface"
            >
              <User className="h-3.5 w-3.5" />
              我的订单
            </button>
          )}
          {cartCount > 0 && (
            <a href="#menu" className="flex items-center gap-1.5 rounded-full bg-kiln px-3 py-1.5 text-xs font-bold text-ash transition hover:bg-kiln-light">
              <ShoppingBag className="h-3.5 w-3.5" />
              {cartCount}
            </a>
          )}
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="hidden rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-kiln transition hover:bg-surface lg:inline-flex"
          >
            商家登录
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-kiln lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-ash px-5 pb-4 lg:hidden animate-fade-in">
          <div className="grid gap-0 pt-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-medium text-kiln border-b border-border/50"
              >
                {item.label}
              </a>
            ))}
            {customer && onOpenMyOrders && (
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onOpenMyOrders(); }}
                className="py-3 text-left text-sm font-medium text-kiln border-b border-border/50"
              >
                我的订单
              </button>
            )}
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); navigate("/admin"); }}
              className="py-3 text-left text-sm font-medium text-kiln"
            >
              商家登录
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

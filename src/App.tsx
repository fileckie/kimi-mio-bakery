import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAppStore } from "./stores/appStore";
import { CustomerPage } from "./components/customer/CustomerPage";
import { AdminPage } from "./components/admin/AdminPage";
import { PosTerminal } from "./components/admin/PosTerminal";
import { AdminLogin } from "./components/admin/AdminLogin";
import { LoadingShell } from "./components/ui/LoadingShell";
import { ToastContainer } from "./components/ui/Toast";

function App() {
  const { route, products, stores, isLoading, error, refreshData, setRoute } = useAppStore();
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => !!sessionStorage.getItem("mio_admin_token"));

  useEffect(() => {
    refreshData();
    const onPop = () => {
      const path = window.location.pathname;
      if (path === "/admin" || path === "/admin/pos") {
        setRoute(path);
      } else {
        setRoute("/");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ash text-kiln">
        <LoadingShell />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ash text-kiln">
      {/* Network error overlay */}
      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ash/90 backdrop-blur-sm animate-fade-in">
          <div className="mx-4 max-w-sm rounded-2xl border border-border bg-white p-8 text-center shadow-elevated animate-empty-bounce">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ember/10">
              <RotateCcw className="h-7 w-7 text-ember animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <p className="mt-5 font-brush text-xl text-kiln">窑火没点着</p>
            <p className="mt-1.5 font-hand text-sm text-muted">{error}</p>
            <button
              onClick={() => refreshData()}
              className="press-feedback mt-6 inline-flex items-center gap-2 rounded-full bg-kiln px-6 py-3 text-sm font-medium text-ash shadow-soft active:scale-95 transition-transform"
            >
              <RotateCcw className="h-4 w-4" />
              再试一次
            </button>
          </div>
        </div>
      )}

      <div className="animate-page-enter">
        {route === "/" ? (
          <CustomerPage />
        ) : route === "/admin" ? (
          adminLoggedIn ? <AdminPage /> : <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
        ) : route === "/admin/pos" ? (
          adminLoggedIn ? (
            <PosTerminal
              products={products}
              stores={stores}
              inventory={useAppStore.getState().inventory}
            />
          ) : <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
        ) : null}
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;

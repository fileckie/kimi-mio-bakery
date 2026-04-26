import { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
import { CustomerPage } from "./components/customer/CustomerPage";
import { AdminPage } from "./components/admin/AdminPage";
import { PosTerminal } from "./components/admin/PosTerminal";
import { LoadingShell } from "./components/ui/LoadingShell";
import { ToastContainer } from "./components/ui/Toast";

function App() {
  const { route, products, stores, isLoading, error, refreshData, setRoute } = useAppStore();

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

  return (
    <div className="min-h-screen bg-ash text-kiln">
      {isLoading ? (
        <LoadingShell />
      ) : route === "/" ? (
        <CustomerPage />
      ) : route === "/admin" ? (
        <AdminPage />
      ) : route === "/admin/pos" ? (
        <PosTerminal
          products={products}
          stores={stores}
          inventory={useAppStore.getState().inventory}
        />
      ) : null}

      {error && (
        <div className="fixed bottom-4 left-1/2 z-[80] max-w-[92vw] -translate-x-1/2 rounded-full bg-kiln px-6 py-3 text-sm text-ash shadow-soft">
          {error}
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default App;

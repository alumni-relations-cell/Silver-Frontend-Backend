import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { api } from "../../lib/api";

const Stat = ({ label, value }) => (
  <div className="rounded-lg bg-gray-900 border border-gray-700 p-5 shadow-sm">
    <p className="text-sm text-gray-300">{label}</p>
    <p className="text-3xl font-semibold mt-1 text-white">{value}</p>
  </div>
);

export default function Dashboard() {
  const [counts, setCounts] = useState({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("adminToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const fetchCounts = async () => {
    setLoading(true);
    setErr("");
    try {
      // Try an aggregated counts endpoint first
      try {
        const r = await api.get("/api/admin/registrations/counts", { headers: authHeaders });
        const d = r?.data || {};
        const total = Number(d.total ?? d.registered ?? 0);
        const approved = Number(d.approved ?? 0);
        const pending = Number(d.pending ?? 0);
        if (total || approved || pending) {
          setCounts({ total, approved, pending });
          setLoading(false);
          return;
        }
      } catch {
        /* fall through */
      }

      // Fallback: derive counts by calling likely list endpoints
      const bases = [
        "/api/admin/registrations",
        "/api/admin/event/registrations",
        "/api/event/registrations",
      ];

      const getCount = async (base, status) => {
        const res = await api.get(base, {
          headers: authHeaders,
          params: status ? { status } : undefined,
        });
        const payload = res?.data;
        if (Array.isArray(payload)) return payload.length;
        if (payload && typeof payload.total === "number") return payload.total;
        if (payload && Array.isArray(payload.items)) return payload.items.length;
        return 0;
      };

      let computed = null;
      for (const base of bases) {
        try {
          const [approved, pending] = await Promise.all([
            getCount(base, "APPROVED"),
            getCount(base, "PENDING"),
          ]);
          let total = 0;
          try {
            total = await getCount(base, "");
          } catch {
            total = approved + pending; // best-effort if no unfiltered endpoint
          }
          computed = { total, approved, pending };
          break;
        } catch {
          // try next base
        }
      }

      if (!computed) throw new Error("Unable to fetch registration counts");
      setCounts(computed);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load counts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top strip (matches AdminRegistrations tone) */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              AR
            </div>
            <div>
              <h1 className="text-white font-semibold">Admin Panel</h1>
              <p className="text-xs text-gray-300">Created with love for Alumni Relations Cell</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCounts}
              className="px-3 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Refresh
            </button>
            <Link
              to="/"
              className="px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              View Site
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <section>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Registration Overview</h2>
          {err && (
            <div className="mb-3 rounded-lg border border-rose-400/30 bg-rose-900/30 text-rose-100 text-sm p-3">
              {err}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg bg-gray-900 border border-gray-800 p-5 animate-pulse">
                  <div className="h-4 w-24 bg-gray-800 rounded" />
                  <div className="h-8 w-20 bg-gray-800 rounded mt-3" />
                </div>
              ))
            ) : (
              <>
                <Stat label="Registered" value={counts.total} />
                <Stat label="Approved" value={counts.approved} />
                <Stat label="Pending" value={counts.pending} />
              </>
            )}
          </div>
        </section>

        {/* Nested content area; matches AdminRegistrations card tone */}
        <section className="rounded-lg bg-gray-900 border border-gray-800 p-5">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

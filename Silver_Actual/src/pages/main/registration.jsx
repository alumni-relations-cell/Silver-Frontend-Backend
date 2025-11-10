// src/pages/main/registration.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { apiUser } from "../../lib/apiUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- Config ---------- */
const BASE_PRICE = 10000;
const ADDON_PRICE = 5000;
const ALLOWED_BATCH = "2000";

/* ---------- Helper: normalize Google user ---------- */
function normalizeGoogleUser(anyUser) {
  if (!anyUser) return null;
  const sub =
    anyUser.sub || anyUser.uid || anyUser.id || anyUser.user_id || anyUser.googleId || null;
  const email = anyUser.email || anyUser.mail || anyUser.user_email || null;
  const name = anyUser.name || anyUser.fullName || anyUser.displayName || "";
  const picture = anyUser.picture || anyUser.photoURL || anyUser.avatar || "";
  if (!sub || !email) return null;
  return { sub, email, name, picture };
}

/* ---------- Helper: API base ---------- */
const apiBase = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/+$/, "");

/* ---------- ReceiptImage (user route first, then admin fallback) ---------- */
function ReceiptImage({ googleProfile, apiBase, registrationId, refreshKey }) {
  const [imgUrl, setImgUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const ranRef = React.useRef(false); // avoid double-run in dev StrictMode

  useEffect(() => {
    // reset for every refreshKey change
    ranRef.current = false;
  }, [refreshKey]);

  React.useEffect(() => {
    if (!googleProfile?.sub) return;
    if (ranRef.current) return; // prevent double fetch in dev
    ranRef.current = true;

    let revoked = false;
    let objectUrl = null;

    const fetchReceipt = async () => {
      setLoading(true);
      setError(null);
      setImgUrl(null);

      try {
        const authRaw = typeof window !== "undefined" ? localStorage.getItem("app_auth") : null;
        const token = authRaw ? JSON.parse(authRaw).token : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const buster = `t=${Date.now()}&v=${encodeURIComponent(refreshKey || "")}`;

        // 1) Try user route first
        const userHeaders = {
          ...headers,
          "x-oauth-uid": googleProfile?.sub,
        };
        const userUrl = `${apiBase}/api/event/registration/receipt?${buster}`;

        const resUser = await fetch(userUrl, {
          headers: userHeaders,
          cache: "no-store",
          credentials: "include",
        });

        if (resUser.ok) {
          const blob = await resUser.blob();
          if (revoked) return;
          objectUrl = URL.createObjectURL(blob);
          setImgUrl(objectUrl);
          setLoading(false);
          return;
        }

        // If 404/401/403 on user route, try admin fallback (if we have id)
        if (registrationId) {
          const adminUrl = `${apiBase}/api/admin/event/registrations/${registrationId}/receipt?${buster}`;
          const resAdmin = await fetch(adminUrl, {
            headers,
            cache: "no-store",
            credentials: "include",
          });

          if (resAdmin.ok) {
            const blob = await resAdmin.blob();
            if (revoked) return;
            objectUrl = URL.createObjectURL(blob);
            setImgUrl(objectUrl);
            setLoading(false);
            return;
          }

          if (resAdmin.status === 404) {
            throw new Error("Receipt not found");
          }
        }

        // Either user route failed without admin fallback, or both failed
        const errorMsg =
          resUser.status === 404 ? "Receipt not found" : `Failed to load receipt (status: ${resUser.status})`;
        throw new Error(errorMsg);
      } catch (err) {
        setError(err.message || "Failed to load receipt");
      } finally {
        if (!revoked) setLoading(false);
      }
    };

    fetchReceipt();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [googleProfile?.sub, apiBase, registrationId, refreshKey]);

  return (
    <div className="mt-2">
      <p className="text-white/60">Receipt:</p>
      {loading ? (
        <div className="mt-2 text-white/70 text-sm">Loading receipt…</div>
      ) : error ? (
        <div className="mt-2 text-red-300 text-sm">{error}</div>
      ) : imgUrl ? (
        <img
          src={imgUrl}
          alt="Receipt"
          className="mt-2 rounded-lg border border-white/10 max-h-72 object-contain"
        />
      ) : (
        <div className="mt-2 text-white/70 text-sm">No receipt available.</div>
      )}
    </div>
  );
}

export default function Registration() {
  const authRaw = typeof window !== "undefined" ? localStorage.getItem("app_auth") : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;

  const [googleProfile, setGoogleProfile] = useState(normalizeGoogleUser(auth?.user));
  const [serverRecord, setServerRecord] = useState(null);

  const [formData, setFormData] = useState({
    name: googleProfile?.name || "",
    batch: ALLOWED_BATCH, // locked
    contact: "",
    email: googleProfile?.email || "",
    comingWithFamily: false,
    familyMembers: [],
    receiptFile: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const totalAmount = useMemo(() => {
    if (!formData.comingWithFamily) return BASE_PRICE;
    const n = formData.familyMembers?.length || 0;
    return BASE_PRICE + ADDON_PRICE * n;
  }, [formData.comingWithFamily, formData.familyMembers]);

  const fetchExisting = useCallback(async (sub) => {
    if (!sub) return;
    try {
      const res = await apiUser.get("/api/event/registration/me", {
        headers: { "x-oauth-uid": sub },
      });
      if (res?.data) {
        setServerRecord(res.data);
        localStorage.setItem("registration_uid", sub);
      } else {
        setServerRecord(null);
        localStorage.removeItem("registration_uid");
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setServerRecord(null);
        localStorage.removeItem("registration_uid");
      } else {
        try {
          const res2 = await apiUser.get("/api/event/registration/me", {
            params: { oauthUid: sub },
          });
          if (res2?.data) {
            setServerRecord(res2.data);
            localStorage.setItem("registration_uid", sub);
          } else {
            setServerRecord(null);
            localStorage.removeItem("registration_uid");
          }
        } catch {
          setServerRecord(null);
        }
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  // load auth (or enrich from /api/auth/me)
  useEffect(() => {
    let stopped = false;
    (async () => {
      try {
        if (googleProfile?.sub && googleProfile?.email) return;
        const res = await apiUser.get("/api/auth/me").catch(() => null);
        const me = normalizeGoogleUser(res?.data);
        if (!stopped && me) {
          setGoogleProfile(me);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || me.name || "",
            email: prev.email || me.email || "",
            batch: ALLOWED_BATCH,
          }));
        }
      } finally {
        if (!stopped) setIsLoadingAuth(false);
      }
    })();
    return () => {
      stopped = true;
    };
    // eslint-disable-next-line
  }, []);

  // check existing record
  useEffect(() => {
    if (!googleProfile?.sub) return;
    setIsChecking(true);
    fetchExisting(googleProfile.sub);
  }, [googleProfile?.sub, fetchExisting]);

  // refresh if cached UID matches
  useEffect(() => {
    const cached = localStorage.getItem("registration_uid");
    if (cached && googleProfile?.sub && cached === googleProfile.sub) {
      setIsChecking(true);
      fetchExisting(googleProfile.sub);
    }
  }, [googleProfile?.sub, fetchExisting]);

  // refresh when tab becomes visible
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && googleProfile?.sub) {
        setIsChecking(true);
        fetchExisting(googleProfile.sub);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [googleProfile?.sub, fetchExisting]);

  const handleLogout = () => {
    localStorage.removeItem("app_auth");
    window.location.href = "/login";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (String(formData.batch) !== ALLOWED_BATCH) {
      newErrors.batch = `This event is only for batch ${ALLOWED_BATCH}`;
    }

    const phoneRe = /^[0-9]{10}$/;
    if (!formData.contact.trim()) newErrors.contact = "Contact number is required";
    else if (!phoneRe.test(formData.contact)) newErrors.contact = "Invalid contact number";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRe.test(formData.email)) newErrors.email = "Invalid email address";

    if (formData.comingWithFamily) {
      formData.familyMembers.forEach((m, idx) => {
        if (!m.name?.trim()) newErrors[`family_${idx}_name`] = "Member name is required";
        if (!m.relation?.trim()) newErrors[`family_${idx}_relation`] = "Relation is required";
      });
    }

    if (!formData.receiptFile) newErrors.receiptFile = "Upload payment receipt (image)";
    else if (!/^image\//.test(formData.receiptFile.type))
      newErrors.receiptFile = "Receipt must be an image";

    setErrors(newErrors);
    if (Object.keys(newErrors).length) toast.error("Please fix the highlighted errors.");
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((s) => ({ ...s, [name]: checked }));
      if (name === "comingWithFamily" && !checked) {
        setFormData((s) => ({ ...s, familyMembers: [] }));
      }
      return;
    }
    if (type === "file") {
      const file = files?.[0] || null;
      setFormData((s) => ({ ...s, receiptFile: file }));
      setErrors((prev) => ({ ...prev, receiptFile: undefined }));
      return;
    }
    if (name === "batch") return;
    setFormData((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addFamilyMember = () =>
    setFormData((s) => ({ ...s, familyMembers: [...s.familyMembers, { name: "", relation: "" }] }));

  const removeFamilyMember = (idx) =>
    setFormData((s) => ({ ...s, familyMembers: s.familyMembers.filter((_, i) => i !== idx) }));

  const updateFamilyMember = (idx, key, value) => {
    setFormData((s) => {
      const arr = [...s.familyMembers];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...s, familyMembers: arr };
    });
    const errKey = key === "name" ? `family_${idx}_name` : `family_${idx}_relation`;
    if (errors[errKey]) setErrors((prev) => ({ ...prev, [errKey]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let me = googleProfile;
    if (!me) {
      const res = await apiUser.get("/api/auth/me").catch(() => null);
      me = normalizeGoogleUser(res?.data);
      if (me) setGoogleProfile(me);
    }
    if (!me?.sub || !me?.email) {
      toast.error("Google account missing. Please login again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("oauthUid", me.sub);
      fd.append("oauthEmail", me.email);
      fd.append("name", formData.name);
      fd.append("batch", ALLOWED_BATCH);
      fd.append("contact", formData.contact);
      fd.append("email", formData.email || me.email);
      fd.append("comingWithFamily", String(formData.comingWithFamily));
      fd.append("familyMembers", JSON.stringify(formData.familyMembers || []));
      fd.append("amount", "0"); // server computes/validates
      if (formData.receiptFile) fd.append("receipt", formData.receiptFile);

      const userToken = auth?.token;
      const headers = userToken ? { Authorization: `Bearer ${userToken}` } : undefined;

      const res = await apiUser.post("/api/event/register", fd, { headers });
      if (!res || res.status >= 400) throw new Error("Registration failed");

      setServerRecord(res.data);
      localStorage.setItem("registration_uid", me.sub);
      toast.success("Submitted! Waiting for admin approval.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----- UPI copy helpers ----- */
  const UPI_ID = "Getepay.mbandhan118166";
  const [copiedUpi, setCopiedUpi] = useState(false);
  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(UPI_ID);
      } else {
        const ta = document.createElement("textarea");
        ta.value = UPI_ID;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 1200);
    } catch {
      toast.error("Could not copy UPI ID");
    }
  };

  const LoginCallout = () => (
    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 px-4 py-3 rounded-xl">
      <p className="font-semibold">You’re not logged in</p>
      <p className="text-sm opacity-90">
        Please <a href="/login" className="underline">sign in with Google</a> to register.
      </p>
    </div>
  );

  const StickyPendingBanner = () =>
    serverRecord?.status === "PENDING" ? (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20">
        <div className="animate-[pulse_2s_ease-in-out_infinite] bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg">
          Your registration is pending admin approval
        </div>
      </div>
    ) : null;

  /* ---------- Loading / guards ---------- */
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
        <div className="text-white/70">Loading…</div>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
        <div className="text-white/70">Checking your registration…</div>
      </div>
    );
  }

  if (!googleProfile) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-xl bg-[#292929] rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Event Registration</h2>
          <LoginCallout />
          <a
            href="/login"
            className="inline-block mt-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </a>
        </div>
        <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      </div>
    );
  }

  /* ---------- Summary page (already registered) ---------- */
  if (serverRecord) {
    const r = serverRecord;
    return (
      <>
        <StickyPendingBanner />
        <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
          <div className="w-full max-w-2xl bg-[#292929] rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Your Registration</h2>
              <div className="flex items-center flex-wrap gap-3">
                {/* Stable status badge in header */}
                <span
                  className={[
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
                    r.status === "APPROVED"
                      ? "bg-green-600/20 text-green-300 border-green-500/30"
                      : r.status === "REJECTED"
                      ? "bg-red-600/20 text-red-300 border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
                  ].join(" ")}
                  title={r.status || "PENDING"}
                >
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-current opacity-80" />
                  {r.status || "PENDING"}
                </span>

                {r.status === "APPROVED" && String(r.batch) === ALLOWED_BATCH && (
                  <a
                    href="/room-allocation"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
                    title="Room allocation will open soon"
                  >
                    Room Allocation
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
              {googleProfile.picture && (
                <img
                  src={googleProfile.picture}
                  alt={googleProfile.name || "User"}
                  className="w-8 h-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="text-sm">
                <p className="text-white/90">
                  Signed in as <span className="font-semibold">{googleProfile.name}</span>
                </p>
                <p className="text-white/60">{googleProfile.email}</p>
              </div>

              {/* Right-aligned timestamp */}
              <div className="ml-auto text-right text-xs text-white/60">
                {r.approvedAt
                  ? `Approved: ${new Date(r.approvedAt).toLocaleString()}`
                  : r.createdAt
                  ? `Submitted: ${new Date(r.createdAt).toLocaleString()}`
                  : ""}
              </div>
            </div>

            <div className="space-y-3 text-white/90">
              <p><span className="text-white/60">Name:</span> {r.name}</p>
              <p><span className="text-white/60">Batch:</span> {r.batch} (event is for {ALLOWED_BATCH})</p>
              <p><span className="text-white/60">Contact:</span> {r.contact}</p>
              <p><span className="text-white/60">Email:</span> {r.email}</p>
              <p><span className="text-white/60">Attending:</span> {r.comingWithFamily ? "With Family" : "Alone"}</p>
              {r.comingWithFamily && (
                <div>
                  <p className="text-white/60">Family Members:</p>
                  <ul className="list-disc list-inside">
                    {(r.familyMembers || []).map((m, i) => (
                      <li key={i}>{m.name} — {m.relation}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p><span className="text-white/60">Amount:</span> ₹{Number(r.amount || 0).toLocaleString("en-IN")}</p>

              {/* Receipt fetch & render */}
              <ReceiptImage
                googleProfile={googleProfile}
                apiBase={apiBase}
                registrationId={r._id}
                refreshKey={r.updatedAt || r._id}
              />
            </div>

            <p className="text-white/60 text-sm mt-6">
              Status updates will appear here. One registration per Google account.
            </p>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      </>
    );
  }

  /* ---------- Registration form (only if no record) ---------- */
  return (
    <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-2xl bg-[#292929] rounded-2xl shadow-2xl p-8 relative">
        <div className="absolute -top-3 right-6">
          <span className="bg-[#EE634F] text-white text-xs px-3 py-1 rounded-full shadow">
            Complete payment, then upload receipt
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Event Registration</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6 rounded-xl border border-white/10 bg-white/5 p-3">
          {googleProfile.picture && (
            <img
              src={googleProfile.picture}
              alt={googleProfile.name || "User"}
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="text-sm">
            <p className="text-white/90">
              Signed in as <span className="font-semibold">{googleProfile.name}</span>
            </p>
            <p className="text-white/60">{googleProfile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                errors.name ? "border border-red-500" : "border border-[#444444]"
              }`}
            />
            {errors.name && <p className="text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Batch locked to 2000 */}
          <div>
            <label className="block mb-2 text-gray-300">Batch</label>
            <input
              type="text"
              name="batch"
              value={ALLOWED_BATCH}
              readOnly
              className={`w-full p-3 rounded-lg bg-[#2e2e2e] text-white border ${
                errors.batch ? "border-red-500" : "border-[#444444]"
              }`}
            />
            <p className="text-white/50 text-xs mt-1">This event is only for batch {ALLOWED_BATCH}.</p>
            {errors.batch && <p className="text-red-400 mt-1">{errors.batch}</p>}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block mb-2 text-gray-300">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="10-digit number"
                className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                  errors.contact ? "border border-red-500" : "border border-[#444444]"
                }`}
              />
              {errors.contact && <p className="text-red-400 mt-1">{errors.contact}</p>}
            </div>

            <div className="flex-1">
              <label className="block mb-2 text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                  errors.email ? "border border-red-500" : "border border-[#444444]"
                }`}
              />
              {errors.email && <p className="text-red-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="comingWithFamily"
              type="checkbox"
              name="comingWithFamily"
              checked={formData.comingWithFamily}
              onChange={handleChange}
              className="w-5 h-5 accent-[#EE634F]"
            />
            <label htmlFor="comingWithFamily" className="text-gray-300">
              Attending with family
            </label>
          </div>

          {formData.comingWithFamily && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Family Members</p>
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
                >
                  + Add member
                </button>
              </div>
              {(formData.familyMembers || []).map((m, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/5 p-3 rounded-lg border border-white/10"
                >
                  <div className="md:col-span-1">
                    <label className="block mb-1 text-gray-300 text-sm">Name</label>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateFamilyMember(idx, "name", e.target.value)}
                      className={`w-full p-2.5 rounded-lg bg-[#333333] text-white focus:outline-none ${
                        errors[`family_${idx}_name`] ? "border border-red-500" : "border border-[#444444]"
                      }`}
                    />
                    {errors[`family_${idx}_name`] && (
                      <p className="text-red-400 mt-1 text-sm">{errors[`family_${idx}_name`]}</p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block mb-1 text-gray-300 text-sm">Relation</label>
                    <select
                      value={m.relation}
                      onChange={(e) => updateFamilyMember(idx, "relation", e.target.value)}
                      className={`w-full p-2.5 rounded-lg bg-[#333333] text-white focus:outline-none ${
                        errors[`family_${idx}_relation`]
                          ? "border border-red-500"
                          : "border border-[#444444]"
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors[`family_${idx}_relation`] && (
                      <p className="text-red-400 mt-1 text-sm">
                        {errors[`family_${idx}_relation`]}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(idx)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-white/80 text-sm">Amount to Pay</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>

          {/* UPI card */}
          <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-white font-semibold mb-3">Pay via UPI</p>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="flex justify-center sm:block">
                {/* If Vite fails to resolve, import:
                   import qrImg from "../../assets/QR.jpg";
                   <img src={qrImg} ... />
                */}
                <img
                  src="../../assets/QR.jpg"
                  alt="UPI QR"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border border-white/10 object-contain bg-white shrink-0"
                />
              </div>

              <div className="text-white/80 text-sm flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/60 whitespace-nowrap">UPI ID:</span>
                  <span className="font-medium break-all">Getepay.mbandhan118166</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="ml-1 inline-flex items-center rounded px-2 py-[2px] text-[11px]
                               border border-white/15 bg-white/10 hover:bg-white/15 text-white/90 transition"
                    aria-label="Copy UPI ID"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="mt-2">
                  <span className="text-white/60">Base Fee:</span>{" "}
                  ₹{BASE_PRICE.toLocaleString("en-IN")} (Alone)
                </p>
                <p>
                  <span className="text-white/60">Add-on:</span>{" "}
                  ₹{ADDON_PRICE.toLocaleString("en-IN")} per additional person
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Upload Payment Receipt (image)
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              name="receipt"
              required
              aria-required="true"
              className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#EE634F] file:text-white file:cursor-pointer text-white ${
                errors.receiptFile ? "border border-red-500" : "border border-[#444444]"
              } w-full p-2.5 rounded-lg bg-[#333333]`}
            />
            {errors.receiptFile && <p className="text-red-400 mt-1">{errors.receiptFile}</p>}
            {formData.receiptFile && (
              <div className="mt-3">
                <p className="text-white/70 text-sm mb-2">Preview:</p>
                <img
                  src={URL.createObjectURL(formData.receiptFile)}
                  alt="Receipt preview"
                  className="rounded-lg border border-white/10 max-h-72 object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EE634F] hover:bg-[#d65544] text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>

          <p className="text-white/60 text-xs text-center">
            After submission your status will show as <span className="text-white">Pending Approval</span> until an admin verifies your payment.
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
    </div>
  );
}

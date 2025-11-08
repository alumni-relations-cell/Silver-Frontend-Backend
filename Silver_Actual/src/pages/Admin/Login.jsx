import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../lib/api.ts"; // baseURL comes from VITE_API_BASE_URL

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post(
        "/api/admin/auth/login",
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          // withCredentials is already enabled in api if you need cookies
        }
      );

      // expect { token: "..." }
      const token = res?.data?.token;
      if (!token) throw new Error("Invalid response from server");

      localStorage.setItem("adminToken", token);
      navigate("/admin/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="bg-gray-800 dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 dark:border-gray-700 mx-4 sm:mx-0">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600 dark:bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white dark:text-white">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-300 dark:text-gray-300">
              Sign in to access the dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 dark:bg-red-900/20 border border-red-500/30 dark:border-red-500/30 text-red-300 dark:text-red-300 rounded-lg text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 dark:placeholder-gray-400 text-white dark:text-white"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 dark:placeholder-gray-400 text-white dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-400 hover:text-gray-200 dark:hover:text-gray-200 transition duration-200"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 flex items-center justify-center ${
                loading || !username || !password
                  ? "bg-indigo-700 dark:bg-indigo-700 cursor-not-allowed"
                  : "bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 hover:shadow-md"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
            <p>Secure admin access • Powered by YourApp</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

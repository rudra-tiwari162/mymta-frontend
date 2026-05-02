import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    // Extract subdomain from current URL
    const hostname = window.location.hostname;
    // Handle cases like apple.localhost or apple.localhost:8082
    const parts = hostname.split(".");
    
    // In local development, hostname might be 'apple.localhost'
    if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
      setSubdomain(parts[0]);
    } else if (parts.length > 2) {
      // For production domains like apple.example.com
      setSubdomain(parts[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const tenantUrl = subdomain 
        ? `http://${subdomain}.localhost:8000/api/login/`
        : `http://localhost:8000/api/login/`;
      
      const response = await fetch(tenantUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.detail ||
          "Login failed. Please check your credentials.";
        console.error("❌ Login failed:", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Store the access token
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type || "Bearer");

      // Redirect to dashboard
      setTimeout(() => {
        if (window.location.hostname === "localhost") {
          const port = window.location.port ? `:${window.location.port}` : "";
          window.location.href = `http://${subdomain}.localhost${port}/`;
        } else {
          navigate("/");
        }
      }, 500);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-green-600">nexora</span>
          </h1>
          {subdomain ? (
            <p className="text-gray-600 text-sm">
              Workspace: <span className="font-medium text-green-600">{subdomain}</span>
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              Enter your workspace subdomain to continue
            </p>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-600 text-sm mb-6">
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subdomain Input (if not detected) */}
            {!subdomain && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Workspace Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    placeholder="your-workspace"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                  <span className="px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm">
                    .localhost
                  </span>
                </div>
              </div>
            )}
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                />
                <span className="text-gray-700">Remember me</span>
              </label>
              <a
                href="#"
                className="text-green-600 hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset is not yet implemented");
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Need help?</span>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-2">
            <a
              href="mailto:support@nexora.io"
              className="block text-center text-sm text-green-600 hover:underline font-medium"
            >
              Contact support
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have a workspace yet?{" "}
          <a
            href="/"
            className="text-green-600 font-medium hover:underline"
          >
            Create one here
          </a>
        </p>
      </div>
    </div>
  );
}

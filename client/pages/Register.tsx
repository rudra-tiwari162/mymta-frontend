import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const sendClientLog = async (message: string) => {
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
    } catch {
      // Ignore logging failures so the user flow is not interrupted.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate inputs
    if (!formData.name.trim()) {
      setError("Company name is required");
      setLoading(false);
      return;
    }

    if (!formData.subdomain.trim()) {
      setError("Subdomain is required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    // Subdomain: lowercase, alphanumeric, hyphens only
    if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      setError(
        "Subdomain can only contain lowercase letters, numbers, and hyphens"
      );
      setLoading(false);
      return;
    }

    // Subdomain cannot start or end with hyphen
    if (formData.subdomain.startsWith("-") || formData.subdomain.endsWith("-")) {
      setError("Subdomain cannot start or end with a hyphen");
      setLoading(false);
      return;
    }

    try {
      console.log("📤 Sending registration request...", {
        name: formData.name,
        subdomain: formData.subdomain,
      });

      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          subdomain: formData.subdomain.toLowerCase().trim(),
          email: `admin@${formData.subdomain.toLowerCase().trim()}.com`,
          password: formData.password,
        }),
      });

      const rawText = await response.text();
      let data: any = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        console.warn("⚠️ Failed to parse register response as JSON:", rawText);
        data = { error: "Server returned invalid JSON" };
      }

      console.log("📥 Backend response:", {
        status: response.status,
        rawText,
        data,
      });

      if (!response.ok) {
        // Try to extract detailed error message
        let errorMessage = "Registration failed. Please try again.";

        if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.subdomain) {
          errorMessage = `Subdomain: ${
            Array.isArray(data.subdomain)
              ? data.subdomain[0]
              : data.subdomain
          }`;
        } else if (data.name) {
          errorMessage = `Company name: ${
            Array.isArray(data.name) ? data.name[0] : data.name
          }`;
        } else if (data.password) {
          errorMessage = `Password: ${
            Array.isArray(data.password) ? data.password[0] : data.password
          }`;
        } else {
          // If response is JSON but no specific field error
          errorMessage =
            Object.values(data)[0]?.toString() ||
            `Error (${response.status}): Registration failed`;
        }

        await sendClientLog(`Registration failed: ${errorMessage}`);
        console.error("❌ Registration error:", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      await sendClientLog(`Registration succeeded for subdomain=${formData.subdomain}`);
      console.log("✅ Registration successful", data);
      setSuccess(true);

      // Redirect to the tenant's subdomain login page
      setTimeout(() => {
        const port = window.location.port ? `:${window.location.port}` : "";
        const loginUrl = `http://${formData.subdomain.toLowerCase().trim()}.localhost${port}/login`;
        console.log("🔄 Redirecting to tenant login:", loginUrl);
        window.location.href = loginUrl;
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      await sendClientLog(`Network error during registration: ${errorMsg}`);
      console.error("❌ Network error:", errorMsg);
      setError(`Network error: ${errorMsg}`);
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
          <p className="text-gray-600">Create your workspace</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Your workspace has been created. Redirecting to login...
              </p>
              <div className="flex justify-center">
                <Loader size={24} className="animate-spin text-green-600" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Acme Corporation"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The official name of your company
                </p>
              </div>

              {/* Subdomain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Workspace Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    placeholder="acme"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                  <span className="px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm">
                    .localhost
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your unique workspace URL: {formData.subdomain || "your-subdomain"}.localhost
                </p>
              </div>

              {/* Admin Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters. Used to log in as admin.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {loading ? "Creating Workspace..." : "Create Workspace"}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                By creating a workspace, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have a workspace?{" "}
          <a href="/" className="text-green-600 font-medium hover:underline">
            Sign in instead
          </a>
        </p>
      </div>
    </div>
  );
}

import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, m as motion, X, b as LogIn, U as User } from "./index-CQn4MAOt.js";
const __iconNode = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode);
eval('window.__saveToken = window.__saveToken || function(t) { try { localStorage.setItem("auth_token", String(t)); } catch(e) {} }');
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = reactExports.useState("login");
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { username, password } : { username, password, name };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        const token = data.data.token;
        if (token) {
          window.__saveToken(token);
        }
        onSuccess(data.data.user, token);
        onClose();
      } else {
        setError(data.message || "Terjadi kesalahan");
      }
    } catch (err) {
      setError("Gagal menghubungkan ke server");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        className: "relative bg-white dark:bg-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-100 dark:shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-8 h-8" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold dark:text-white", children: mode === "login" ? "Selamat Datang" : "Buat Akun" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm", children: mode === "login" ? "Masuk untuk pengalaman bermain lebih seru" : "Daftar sekarang dan mulai petualanganmu" })
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm", children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
              mode === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    placeholder: "Nama Lengkap",
                    className: "w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white",
                    value: name,
                    onChange: (e) => setName(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    placeholder: "Username atau Email",
                    className: "w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white",
                    value: username,
                    onChange: (e) => setUsername(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "password",
                    required: true,
                    placeholder: "Password",
                    className: "w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white",
                    value: password,
                    onChange: (e) => setPassword(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "submit",
                  disabled: loading,
                  className: "w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50",
                  children: loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setMode(mode === "login" ? "register" : "login"),
                className: "text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline",
                children: mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 pt-6 border-t border-gray-100 dark:border-zinc-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "w-full py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "https://www.google.com/favicon.ico", className: "w-5 h-5", alt: "Google" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold dark:text-white", children: "Masuk dengan Google" })
            ] }) })
          ] })
        ]
      }
    )
  ] });
}
export {
  AuthModal as default
};

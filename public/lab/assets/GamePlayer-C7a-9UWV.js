import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, m as motion, X, L as LoaderCircle } from "./index-CQn4MAOt.js";
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
const Maximize2 = createLucideIcon("maximize-2", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
];
const Minimize2 = createLucideIcon("minimize-2", __iconNode$1);
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode);
const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
};
function GamePlayer({ game, onClose }) {
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [hasError, setHasError] = reactExports.useState(false);
  const [retryCount, setRetryCount] = reactExports.useState(0);
  const [isIOSDevice, setIsIOSDevice] = reactExports.useState(false);
  const gameUrl = game.iframe_url || game.url || "";
  console.log("[GAME] Loading game:", game.title, "URL:", gameUrl);
  reactExports.useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);
  const toggleFullscreen = reactExports.useCallback(() => {
    const container = document.getElementById("game-container");
    if (!container) return;
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          container.classList.add("ios-fullscreen");
          document.body.style.overflow = "hidden";
          setIsFullscreen(true);
        });
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else {
        container.classList.add("ios-fullscreen");
        document.body.style.overflow = "hidden";
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          container.classList.remove("ios-fullscreen");
          document.body.style.overflow = "";
        });
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else {
        container.classList.remove("ios-fullscreen");
        document.body.style.overflow = "";
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  reactExports.useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        const container = document.getElementById("game-container");
        container?.classList.remove("ios-fullscreen");
        document.body.style.overflow = "";
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);
  const handleIframeLoad = reactExports.useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);
  const handleIframeError = reactExports.useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);
  const handleRetry = reactExports.useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setIsLoading(true);
    setHasError(false);
  }, []);
  if (!gameUrl) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[200] bg-black flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-white font-bold truncate max-w-[200px] sm:max-w-md", children: game.title })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-lg mb-2", children: "Game URL tidak tersedia" })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      id: "game-container",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[200] bg-black flex flex-col",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .ios-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
        }
        .ios-fullscreen .game-header {
          display: none !important;
        }
        .ios-fullscreen .game-footer {
          display: none !important;
        }
        .ios-fullscreen .game-frame {
          height: 100vh !important;
        }
      ` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "game-header h-14 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-white font-bold truncate max-w-[150px] sm:max-w-md", children: game.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleFullscreen, className: "p-2 text-gray-400 hover:text-white transition-colors", title: "Toggle Fullscreen", children: isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "w-5 h-5" }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "game-frame flex-1 relative bg-zinc-950 overflow-hidden", children: [
          isLoading && !hasError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-zinc-950 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "Loading game..." })
          ] }) }),
          hasError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-zinc-950 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center px-4 max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-lg mb-2", children: "Failed to load game" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Please try again." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleRetry, className: "flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors mx-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" }),
              " Retry"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "iframe",
            {
              id: "game-iframe",
              src: gameUrl,
              className: "w-full h-full border-none",
              allow: "autoplay; fullscreen; accelerometer; encrypted-media; gyroscope; picture-in-picture; gamepad; clipboard-write",
              allowFullScreen: true,
              sandbox: "allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-presentation",
              title: game.title,
              style: { border: "none", background: "#09090b" },
              onLoad: handleIframeLoad,
              onError: handleIframeError,
              loading: "eager"
            },
            retryCount
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "game-footer sm:hidden h-10 bg-zinc-900 flex items-center justify-center text-[10px] text-gray-500 uppercase tracking-widest flex-shrink-0", children: "Gunakan mode landscape untuk pengalaman terbaik" })
      ]
    }
  );
}
export {
  GamePlayer as default
};

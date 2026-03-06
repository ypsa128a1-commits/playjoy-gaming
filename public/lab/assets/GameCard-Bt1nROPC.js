import { j as jsxRuntimeExports, m as motion, d as LazyImage, T as TrendingUp, P as Play } from "./index-CQn4MAOt.js";
const categoryIcons = {
  "action": "⚔️",
  "puzzle": "🧩",
  "racing": "🏎️",
  "shooting": "🎯",
  "strategy": "🧠",
  "arcade": "🕹️",
  "sports": "⚽",
  "adventure": "🗺️",
  "girls": "💕",
  "multiplayer": "👥",
  "horror": "👻",
  "simulation": "🎮",
  "hypercasual": "🎲",
  "casual": "🎰",
  "board": "♟️",
  "other": "🎮",
  "default": "🎮"
};
function GameCard({ game, onView }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      whileHover: { scale: 1.05, y: -5 },
      whileTap: { scale: 0.98 },
      onClick: () => onView(game.id),
      className: "game-card relative flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group/card",
      style: { background: "var(--card)", border: "1px solid var(--border)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          LazyImage,
          {
            src: game.thumbnail || `https://picsum.photos/seed/${game.id}/400/600`,
            alt: game.title,
            className: "aspect-[3/4]"
          }
        ),
        (game.featured === 1 || game.is_featured === 1) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-bold rounded shadow-lg", children: "TOP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-2 sm:p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 text-white truncate group-hover/card:text-emerald-400 transition-colors", children: game.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] sm:text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-300 truncate max-w-[60%]", children: [
              categoryIcons[game.category?.toLowerCase()] || "🎮",
              " ",
              game.category || "Game"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 sm:gap-1 text-emerald-400 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-2.5 h-2.5 sm:w-3 sm:h-3" }),
              game.views?.toLocaleString?.() || 0
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { scale: 0.5 },
            whileHover: { scale: 1.1 },
            className: "w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shadow-xl",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5 sm:w-7 sm:h-7 text-black ml-0.5", fill: "currentColor" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none ring-2 ring-emerald-500/50" })
      ]
    }
  );
}
export {
  GameCard as default
};

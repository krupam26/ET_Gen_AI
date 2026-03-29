import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, Search, X, TrendingUp, TrendingDown, Menu,
  LayoutDashboard, PieChart, Bot, Users, FileText, AlertTriangle, Zap, LogOut,
  Target, User
} from "lucide-react";
import { useUserData } from "../context/UserDataContext";

// ─── Market Ticker Data ───────────────────────────────────────────────────────
const tickerItems = [
  { name: "SENSEX",      value: "73,487.21", change: "+901.40", pct: "+1.24%", up: true },
  { name: "NIFTY 50",    value: "22,326.90", change: "+216.80", pct: "+0.98%", up: true },
  { name: "NIFTY BANK",  value: "47,812.35", change: "-142.60", pct: "-0.30%", up: false },
  { name: "NIFTY MID 50",value: "12,108.75", change: "+88.20",  pct: "+0.73%", up: true },
  { name: "GOLD (MCX)",  value: "₹72,450",   change: "+340",    pct: "+0.47%", up: true },
  { name: "SILVER (MCX)",value: "₹88,120",   change: "-210",    pct: "-0.24%", up: false },
  { name: "CRUDE OIL",   value: "$72.34",    change: "-0.82",   pct: "-1.12%", up: false },
  { name: "USD/INR",     value: "83.42",     change: "-0.18",   pct: "-0.22%", up: false },
  { name: "BITCOIN",     value: "$67,230",   change: "+1,240",  pct: "+1.88%", up: true },
  { name: "10Y G-SEC",   value: "7.12%",     change: "+0.04",   pct: "+0.56%", up: true },
  { name: "INDIA VIX",   value: "13.42",     change: "-0.67",   pct: "-4.76%", up: false },
];

// "My Profile" removed — accessed via the top-right avatar instead
const navItems = [
  { path: "/",          label: "Dashboard",      icon: LayoutDashboard, end: true },
  { path: "/portfolio", label: "Portfolio X-Ray", icon: PieChart },
  { path: "/simulator", label: "Life Simulator",  icon: TrendingUp },
  { path: "/goals",     label: "Goal Optimizer",  icon: Target },
  { path: "/mentor",    label: "AI Mentor",       icon: Bot },
  { path: "/couple",    label: "Couple Planner",  icon: Users },
  { path: "/tax",       label: "Tax Wizard",      icon: FileText },
  { path: "/alerts",    label: "Risk Alerts",     icon: AlertTriangle },
];

const notifications = [
  { id: 1, text: "SIP of ₹25,000 executed successfully",          time: "2m ago",  type: "success" },
  { id: 2, text: "Portfolio down 2.3% today — check Risk Alerts", time: "1h ago",  type: "warning" },
  { id: 3, text: "Tax season reminder: File by July 31",           time: "3h ago",  type: "info" },
];

// ─── Market Ticker ────────────────────────────────────────────────────────────
function MarketTicker() {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div className="overflow-hidden relative" style={{ background: "#1A1A2E", height: 30 }}>
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #1A1A2E, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #1A1A2E, transparent)" }} />
      <motion.div
        className="flex items-center h-full whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-4" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-gray-400 uppercase tracking-wide" style={{ fontSize: "10px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {item.name}
            </span>
            <span className="text-white font-semibold" style={{ fontSize: "11px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {item.value}
            </span>
            <span className="flex items-center gap-0.5 font-semibold" style={{
              fontSize: "10px",
              color: item.up ? "#22C55E" : "#EF4444",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              {item.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {item.pct}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export function Layout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userData, resetUserData } = useUserData();
  const navigate = useNavigate();

  const initials = userData?.name
    ? userData.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const handleGoToProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'IBM Plex Sans', 'Inter', sans-serif", background: "#F2F2F2" }}>

      {/* ── ROW 1: ET Header Bar (White) ───────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ borderBottom: "1px solid #E0E0E0" }}>
        <div className="flex items-center px-4" style={{ height: 52 }}>

          {/* ET Logo */}
          <div className="flex items-center gap-2 shrink-0 mr-6">
            <span className="font-black italic leading-none" style={{
              color: "#E21B23", fontSize: "1.6rem",
              fontFamily: "'IBM Plex Serif', Georgia, serif", letterSpacing: "-1px",
            }}>ET</span>
            <div style={{ width: 1, height: 28, background: "#E0E0E0" }} />
            <div>
              <p className="font-bold leading-none" style={{ color: "#1A1A1A", fontSize: "0.72rem", letterSpacing: "0.04em" }}>WEALTH</p>
              <p className="font-bold leading-none mt-0.5" style={{ color: "#E21B23", fontSize: "0.72rem", letterSpacing: "0.04em" }}>NAVIGATOR</p>
            </div>
          </div>

          {/* AI Search Bar */}
          <div className="flex-1 max-w-lg relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ask your AI Money Mentor — e.g. Can I retire at 45?"
              className="w-full py-2 pl-8 pr-4 text-xs outline-none transition-all"
              style={{ background: "#F5F5F5", border: "1px solid #E0E0E0", color: "#1A1A1A", borderRadius: 2 }}
              onFocus={e => { e.target.style.borderColor = "#E21B23"; e.target.style.background = "white"; }}
              onBlur={e => { e.target.style.borderColor = "#E0E0E0"; e.target.style.background = "#F5F5F5"; }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={12} style={{ color: "#9CA3AF" }} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Live badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 border"
              style={{ borderColor: "#E21B23", borderRadius: 2 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#E21B23" }}
              />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#E21B23", fontSize: "10px" }}>Markets Live</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className="relative w-8 h-8 flex items-center justify-center transition-colors rounded hover:bg-gray-100"
              >
                <Bell size={16} style={{ color: "#444" }} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "#E21B23" }} />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-10 w-80 bg-white shadow-2xl z-50 overflow-hidden"
                    style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}
                  >
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "#E21B23" }}>
                      <p className="text-white font-bold text-xs uppercase tracking-wide">Alerts</p>
                      <span className="text-white text-xs opacity-70">3 new</span>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 flex gap-3 items-start hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderBottom: "1px solid #F0F0F0" }}>
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: n.type === "success" ? "#16A34A" : n.type === "warning" ? "#D97706" : "#2563EB" }} />
                        <div>
                          <p className="text-gray-700 text-xs leading-snug">{n.text}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profile Avatar — click to open dropdown ── */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 pl-3 transition-opacity hover:opacity-80"
                style={{ borderLeft: "1px solid #E0E0E0" }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "#E21B23" }}>
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-gray-800 font-semibold" style={{ fontSize: "11px", lineHeight: "1.2" }}>{userData?.name ?? "User"}</p>
                  <p className="font-semibold" style={{ fontSize: "9px", color: "#E21B23", letterSpacing: "0.04em" }}>ET PREMIUM</p>
                </div>
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-11 w-52 bg-white shadow-2xl z-50 overflow-hidden"
                    style={{ border: "1px solid #E0E0E0", borderRadius: 2 }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#FFF5F5", borderBottom: "2px solid #E21B23" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                        style={{ background: "#E21B23", fontSize: "13px" }}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold" style={{ fontSize: "12px", color: "#1A1A1A" }}>{userData?.name ?? "User"}</p>
                        <p className="font-semibold" style={{ fontSize: "9px", color: "#E21B23", letterSpacing: "0.04em" }}>ET PREMIUM</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <button
                      onClick={handleGoToProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      style={{ borderBottom: "1px solid #F5F5F5" }}
                    >
                      <User size={14} style={{ color: "#E21B23" }} />
                      <div>
                        <p className="font-semibold" style={{ fontSize: "12px", color: "#1A1A1A" }}>My Profile</p>
                        <p style={{ fontSize: "10px", color: "#AAA" }}>Net worth, assets & goals</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setShowProfileMenu(false); resetUserData(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <LogOut size={14} style={{ color: "#888" }} />
                      <div>
                        <p className="font-semibold" style={{ fontSize: "12px", color: "#555" }}>Edit / Reset Profile</p>
                        <p style={{ fontSize: "10px", color: "#AAA" }}>Re-run onboarding wizard</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={18} style={{ color: "#444" }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── ROW 2: Red Navigation Bar — no horizontal scroll ───────────────── */}
      <nav className="fixed left-0 right-0 z-40" style={{ top: 52, background: "#E21B23" }}>
        <div className="flex items-center px-2" style={{ height: 38 }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end} className="flex-1 min-w-0">
              {({ isActive }) => (
                <motion.div
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.15)" }}
                  className="flex items-center justify-center gap-1 px-1 cursor-pointer transition-colors"
                  style={{
                    height: 38,
                    background: isActive ? "rgba(0,0,0,0.2)" : "transparent",
                    borderBottom: isActive ? "3px solid white" : "3px solid transparent",
                  }}
                >
                  <item.icon size={12} color="rgba(255,255,255,0.9)" className="shrink-0" />
                  <span
                    className="font-semibold truncate hidden sm:block"
                    style={{
                      color: isActive ? "white" : "rgba(255,255,255,0.88)",
                      fontSize: "10.5px",
                      letterSpacing: "0.01em",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
              style={{ background: "#C1191F" }}
            >
              {navItems.map(item => (
                <NavLink key={item.path} to={item.path} end={item.end} onClick={() => setMobileMenuOpen(false)}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2 px-4 py-3"
                      style={{ background: isActive ? "rgba(0,0,0,0.15)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <item.icon size={15} color="white" />
                      <span className="text-white text-sm font-medium">{item.label}</span>
                    </div>
                  )}
                </NavLink>
              ))}
              {/* Profile entry in mobile menu */}
              <button onClick={() => { setMobileMenuOpen(false); navigate("/profile"); }}
                className="w-full flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <User size={15} color="white" />
                <span className="text-white text-sm font-medium">My Profile</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── ROW 3: Market Ticker ───────────────────────────────────────────── */}
      <div className="fixed left-0 right-0 z-30" style={{ top: 90 }}>
        <MarketTicker />
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main style={{ paddingTop: 120 }}>
        <Outlet />
      </main>
    </div>
  );
}

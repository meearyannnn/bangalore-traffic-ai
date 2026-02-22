import { useState, useEffect } from "react";
import PredictForm from "../components/PredictForm";
import HotspotMap from "../components/HotspotMap";
import ImageUpload from "../components/ImageUpload";
import MapView from "../components/MapView";
import TrafficResult from "../components/TrafficResult";
import WebcamCapture from "../components/WebcamCapture";
import RouteMap from "../components/RouteMap";
import LocationTraffic from "../components/LocationTraffic";
import MetroPlanner from "../components/MetroPlanner";
import BusPlanner from "../components/BusPlanner";
import NearestBusStop from "../components/NearestBusStop";
import RailwayPlanner from "../components/RailwayPlanner";
import SmartModeCard from "../components/SmartModeCard";
import ExploreNearby from "../components/ExploreNearby";

import {
  Activity, MapPin, Zap, Image, Train, Bus, Navigation,
  Camera, LayoutDashboard, TrendingUp, Menu, X, ChevronRight, Compass,
} from "lucide-react";
import type { TrafficImageResponse } from "../types/traffic";

// ─── Page IDs ────────────────────────────────────────────────────────────────
type PageId = "overview" | "predict" | "routes" | "transit" | "vision" | "smart" | "explore";

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS: {
  id: PageId; label: string; sub: string;
  icon: React.ReactNode; accent: string;
}[] = [
  { id: "overview", label: "Overview",      sub: "Live hotspot map",        icon: <LayoutDashboard size={17} />, accent: "#c9a84c" },
  { id: "predict",  label: "Prediction",    sub: "AI congestion forecast",  icon: <TrendingUp size={17} />,     accent: "#60a5fa" },
  { id: "routes",   label: "Route Planner", sub: "Point-to-point analysis", icon: <Navigation size={17} />,    accent: "#34d399" },
  { id: "transit",  label: "Transit Hub",   sub: "Metro · Bus · Rail",      icon: <Train size={17} />,         accent: "#f472b6" },
  { id: "vision",   label: "Vision AI",     sub: "Image & webcam analysis", icon: <Camera size={17} />,        accent: "#a78bfa" },
  { id: "smart",    label: "Smart Mode",    sub: "Adaptive suggestions",    icon: <Zap size={17} />,           accent: "#fb923c" },
  { id: "explore",  label: "Explore Nearby", sub: "GPS-powered discovery",  icon: <Compass size={17} />,       accent: "#22d3ee" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --void:   #0c0e14;
    --surf:   #13161f;
    --surf2:  #1a1e2a;
    --border: rgba(201,168,76,0.13);
    --bord2:  rgba(201,168,76,0.32);
    --gold:   #c9a84c;
    --gdim:   rgba(201,168,76,0.07);
    --ash:    #6b6e7a;
    --text:   #d5d0c8;
    --tdim:   #8a8794;
    --sw:     260px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  /* ── Shell ── */
  .app {
    display: flex; min-height: 100vh;
    background: var(--void);
    background-image: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.055) 0%, transparent 65%);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
  }

  /* ── Overlay ── */
  .mob-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); z-index: 45;
  }
  @media(max-width:1023px){ .mob-overlay.on { display:block; } }

  /* ════════════════════
     SIDEBAR
  ════════════════════ */
  .sidebar {
    width: var(--sw); flex-shrink: 0;
    background: var(--surf);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top:0; left:0; bottom:0;
    z-index: 50;
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  @media(max-width:1023px){
    .sidebar { transform: translateX(calc(-1 * var(--sw))); }
    .sidebar.open { transform: translateX(0); }
  }

  .sb-brand {
    padding: 1.5rem 1.25rem;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .sb-logo {
    width:36px; height:36px; flex-shrink:0;
    border: 1px solid var(--bord2); border-radius:9px;
    display:flex; align-items:center; justify-content:center;
    background: var(--gdim); position:relative; overflow:hidden;
  }
  .sb-logo::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(135deg, rgba(201,168,76,0.18) 0%, transparent 60%);
  }
  .sb-logo svg { color:var(--gold); position:relative; z-index:1; }
  .sb-title { flex:1; min-width:0; }
  .sb-title h1 {
    font-family:'Cormorant Garamond',serif;
    font-size:1.1rem; font-weight:500; color:#ede8df;
    letter-spacing:.02em; line-height:1;
  }
  .sb-title p {
    font-size:.6rem; letter-spacing:.16em; text-transform:uppercase;
    color:var(--ash); margin-top:3px; font-weight:300;
  }
  .sb-live {
    display:flex; align-items:center; gap:5px;
    padding:3px 9px; border:1px solid rgba(134,239,172,.22);
    border-radius:100px; background:rgba(134,239,172,.05);
  }
  .sb-live-dot {
    width:6px; height:6px; background:#86efac; border-radius:50%;
    animation: pdot 2s ease-in-out infinite;
  }
  @keyframes pdot {
    0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)}
  }
  .sb-live span {
    font-size:.6rem; letter-spacing:.12em; text-transform:uppercase;
    color:#86efac; font-weight:500;
  }

  .sb-nav-lbl {
    padding:.9rem 1.25rem .4rem;
    font-size:.58rem; letter-spacing:.22em; text-transform:uppercase;
    color:var(--ash); font-weight:500;
  }
  .sb-nav { flex:1; overflow-y:auto; padding:0 .6rem .75rem; }
  .sb-nav::-webkit-scrollbar{width:3px}
  .sb-nav::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

  .sb-item {
    display:flex; align-items:center; gap:10px;
    padding:9px 11px; border-radius:10px;
    cursor:pointer; width:100%; background:none;
    border:1px solid transparent; text-align:left;
    font-family:'DM Sans',sans-serif; color:inherit;
    transition:background .18s, border-color .18s;
    margin-bottom:2px; position:relative;
  }
  .sb-item:hover { background:rgba(255,255,255,.03); }
  .sb-item.on { background:var(--gdim); border-color:var(--border); }
  .sb-item.on::before {
    content:''; position:absolute;
    left:-.6rem; top:50%; transform:translateY(-50%);
    width:3px; height:55%; border-radius:0 2px 2px 0;
    background:linear-gradient(180deg,var(--gold),rgba(201,168,76,.15));
  }
  .sb-icon {
    width:30px; height:30px; border-radius:7px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,.04); transition:background .18s;
  }
  .sb-item.on .sb-icon { background:rgba(201,168,76,.1); }
  .sb-icon svg { opacity:.5; transition:opacity .18s; }
  .sb-item.on .sb-icon svg, .sb-item:hover .sb-icon svg { opacity:1; }
  .sb-txt { flex:1; min-width:0; }
  .sb-name {
    display:block; font-size:.83rem; font-weight:400;
    color:var(--tdim); transition:color .18s; line-height:1;
  }
  .sb-item.on .sb-name, .sb-item:hover .sb-name { color:#ede8df; }
  .sb-sub {
    display:block; font-size:.67rem; color:var(--ash);
    margin-top:2px; font-weight:300;
  }
  .sb-arrow { opacity:0; transition:opacity .18s, transform .18s; color:var(--gold); }
  .sb-item.on .sb-arrow, .sb-item:hover .sb-arrow { opacity:1; transform:translateX(2px); }

  .sb-footer {
    padding:.9rem 1.25rem;
    border-top:1px solid var(--border);
  }
  .sb-city {
    font-family:'Cormorant Garamond',serif;
    font-size:.68rem; letter-spacing:.28em; text-transform:uppercase;
    color:var(--ash); display:flex; align-items:center; gap:8px;
  }
  .sb-city::before,.sb-city::after { content:''; flex:1; height:1px; background:var(--border); }

  /* ════════════════════
     TOPBAR
  ════════════════════ */
  .topbar {
    position:fixed; top:0; right:0; left:var(--sw); height:62px;
    z-index:40; border-bottom:1px solid var(--border);
    background:rgba(12,14,20,.9); backdrop-filter:blur(20px);
    display:flex; align-items:center; padding:0 1.75rem; gap:12px;
    transition:left .3s cubic-bezier(.4,0,.2,1);
  }
  @media(max-width:1023px){ .topbar { left:0 !important; } }

  .topbar-btn {
    display:none; width:34px; height:34px;
    align-items:center; justify-content:center;
    border:1px solid var(--border); border-radius:8px;
    background:none; cursor:pointer; color:var(--tdim);
    flex-shrink:0; transition:background .15s, color .15s;
  }
  .topbar-btn:hover { background:rgba(255,255,255,.05); color:var(--text); }
  @media(max-width:1023px){ .topbar-btn { display:flex; } }

  .topbar-picon {
    width:26px; height:26px; border-radius:7px;
    display:flex; align-items:center; justify-content:center;
    background:var(--gdim); border:1px solid var(--border);
  }
  .topbar-picon svg { width:13px; height:13px; }
  .topbar-ptitle {
    font-family:'Cormorant Garamond',serif;
    font-size:1.05rem; font-weight:500; color:#ede8df; letter-spacing:.02em;
  }
  .topbar-psub { font-size:.68rem; color:var(--ash); font-weight:300; letter-spacing:.04em; }
  .topbar-sep { width:1px; height:16px; background:var(--border); }
  .topbar-right { margin-left:auto; }
  .topbar-count {
    font-size:.62rem; letter-spacing:.14em; color:var(--ash);
    padding:3px 10px; border:1px solid var(--border); border-radius:100px;
  }

  /* ════════════════════
     PAGE BODY
  ════════════════════ */
  .pbody {
    margin-left:var(--sw); padding-top:62px;
    min-height:100vh; flex:1;
    transition:margin-left .3s cubic-bezier(.4,0,.2,1);
  }
  @media(max-width:1023px){ .pbody { margin-left:0 !important; } }

  .pinner { max-width:1080px; margin:0 auto; padding:2.5rem 1.75rem 4rem; }

  /* ════════════════════
     PAGE HERO
  ════════════════════ */
  .phero {
    position:relative;
    border:1px solid var(--border); border-radius:18px;
    padding:2rem 2.5rem; margin-bottom:2.5rem;
    overflow:hidden;
    background:linear-gradient(135deg,var(--surf2) 0%,var(--surf) 100%);
    animation: fsi .35s ease both;
    transition:border-color .25s;
  }
  .phero:hover { border-color:var(--bord2); }
  .phero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse 60% 80% at 100% 50%, var(--hglow,rgba(201,168,76,.08)) 0%, transparent 65%);
    pointer-events:none;
  }
  .phero-wm {
    position:absolute; right:1.5rem; bottom:-.75rem;
    font-family:'Cormorant Garamond',serif;
    font-size:4.5rem; font-weight:600;
    color:rgba(255,255,255,.022); letter-spacing:.2em;
    pointer-events:none; user-select:none; line-height:1;
  }
  .phero-inner { position:relative; display:flex; align-items:flex-start; justify-content:space-between; gap:2rem; }
  .phero-left  { display:flex; align-items:flex-start; gap:14px; }
  .phero-iw {
    width:40px; height:40px; flex-shrink:0; margin-top:2px;
    border:1px solid var(--bord2); border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    background:var(--gdim);
  }
  .phero-iw svg { color:var(--gold); width:18px; height:18px; }
  .phero-txt h2 {
    font-family:'Cormorant Garamond',serif;
    font-size:1.55rem; font-weight:500; color:#ede8df;
    letter-spacing:.015em; margin-bottom:6px;
  }
  .phero-txt p {
    font-size:.85rem; color:var(--ash); max-width:480px;
    line-height:1.7; font-weight:300;
  }

  /* ════════════════════
     CARD
  ════════════════════ */
  .card {
    background:linear-gradient(145deg,rgba(26,30,42,.92) 0%,rgba(19,22,31,.92) 100%);
    border:1px solid var(--border); border-radius:16px;
    padding:1.5rem; position:relative; overflow:hidden;
    transition:border-color .25s, box-shadow .25s;
    animation: fsi .4s ease both;
  }
  .card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent 0%,var(--csh,rgba(201,168,76,.22)) 50%,transparent 100%);
  }
  .card:hover { border-color:var(--bord2); box-shadow:0 8px 40px rgba(0,0,0,.4); }

  .ch { display:flex; align-items:center; gap:10px; margin-bottom:1.25rem; }
  .ca { width:2px; height:18px; border-radius:2px; flex-shrink:0;
    background:linear-gradient(180deg,var(--gold) 0%,rgba(201,168,76,.2) 100%); }
  .ct { font-size:.67rem; font-weight:500; letter-spacing:.18em; text-transform:uppercase; color:#938e83; }
  .ci { margin-left:auto; opacity:.6; display:flex; align-items:center; }
  .ci svg { width:15px; height:15px; }

  .stitle {
    font-family:'Cormorant Garamond',serif;
    font-size:1.12rem; font-weight:500; color:#ede8df;
    letter-spacing:.015em; display:flex; align-items:center; gap:10px; margin-bottom:.5rem;
  }
  .stitle svg { color:var(--gold); width:16px; height:16px; }
  .ssub { font-size:.79rem; color:var(--ash); margin-bottom:1.25rem; font-weight:300; line-height:1.6; }

  /* ════════════════════
     LAYOUTS
  ════════════════════ */
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
  .g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem; }
  .gsb { display:grid; grid-template-columns:300px 1fr; gap:1.5rem; align-items:start; }
  @media(max-width:768px){ .g2,.g3,.gsb { grid-template-columns:1fr; } }
  .sy { display:flex; flex-direction:column; gap:1.25rem; }

  /* ════════════════════
     MAP
  ════════════════════ */
  .mw { border-radius:10px; overflow:hidden; border:1px solid rgba(201,168,76,.1); background:#0d1117; }

  /* ════════════════════
     ORNAMENT
  ════════════════════ */
  .orn { display:flex; align-items:center; gap:10px; margin:2rem 0; }
  .orn-l { flex:1; height:1px; background:linear-gradient(90deg,transparent,var(--bord2),transparent); }
  .orn-d { width:5px; height:5px; background:var(--gold); transform:rotate(45deg); opacity:.6; flex-shrink:0; }

  /* ════════════════════
     STAT TILES
  ════════════════════ */
  .stile {
    background:var(--surf2); border:1px solid var(--border);
    border-radius:12px; padding:1.2rem 1.4rem; position:relative; overflow:hidden;
    animation: fsi .4s ease both;
  }
  .stile::after {
    content:''; position:absolute; bottom:0; right:0;
    width:60px; height:60px;
    background:radial-gradient(circle,var(--tglow,rgba(201,168,76,.1)) 0%,transparent 70%);
  }
  .stile-lbl { font-size:.63rem; letter-spacing:.18em; text-transform:uppercase; color:var(--ash); font-weight:500; margin-bottom:8px; }
  .stile-val { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:500; line-height:1; color:#ede8df; }
  .stile-sub { font-size:.7rem; color:var(--ash); margin-top:4px; font-weight:300; }

  /* ════════════════════
     TRANSIT TABS
  ════════════════════ */
  .ttabs { display:flex; gap:6px; margin-bottom:1.5rem; flex-wrap:wrap; }
  .ttab {
    display:flex; align-items:center; gap:7px;
    padding:6px 15px; border:1px solid var(--border); border-radius:100px;
    background:none; cursor:pointer; font-family:'DM Sans',sans-serif;
    font-size:.77rem; font-weight:400; color:var(--tdim);
    transition:all .18s;
  }
  .ttab:hover { border-color:var(--bord2); color:var(--text); background:var(--gdim); }
  .ttab.on { border-color:var(--bord2); background:var(--gdim); color:#ede8df; }
  .ttab svg { width:13px; height:13px; }

  /* ════════════════════
     ANIMATION
  ════════════════════ */
  @keyframes fsi {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .card:nth-child(2){animation-delay:.07s}
  .card:nth-child(3){animation-delay:.13s}
  .card:nth-child(4){animation-delay:.19s}
  .stile:nth-child(2){animation-delay:.06s}
  .stile:nth-child(3){animation-delay:.12s}
`;

// ─── Main Component ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [page,    setPage]    = useState<PageId>("overview");
  const [sbOpen,  setSbOpen]  = useState(false);
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [prediction, setPrediction] = useState<{ lat:number; lng:number; level:number } | null>(null);
  const [anomaly, setAnomaly] = useState<{ lat:number; lng:number; severity:number } | null>(null);
  const [trafficImageData, setTrafficImageData] = useState<TrafficImageResponse | null>(null);

  // Get user's GPS location on mount
  useEffect(() => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserGps({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.error("GPS Error:", error);
      // State already initialized with Bangalore fallback — no action needed here
    }
  );
}, []);

  const nav = NAV_ITEMS.find(n => n.id === page)!;

  const go = (id: PageId) => { setPage(id); setSbOpen(false); };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* Mobile overlay */}
        <div className={`mob-overlay ${sbOpen ? "on" : ""}`} onClick={() => setSbOpen(false)} />

        {/* ── Sidebar ── */}
        <nav className={`sidebar ${sbOpen ? "open" : ""}`}>
          <div className="sb-brand">
            <div className="sb-logo"><MapPin size={16} /></div>
            <div className="sb-title">
              <h1>BLR Traffic</h1>
              <p>Intelligence Suite</p>
            </div>
            <div className="sb-live">
              <div className="sb-live-dot" />
              <span>Live</span>
            </div>
          </div>

          <div className="sb-nav">
            <div className="sb-nav-lbl">Pages</div>
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`sb-item ${page === item.id ? "on" : ""}`} onClick={() => go(item.id)}>
                <div className="sb-icon" style={{ color: item.accent }}>{item.icon}</div>
                <div className="sb-txt">
                  <span className="sb-name">{item.label}</span>
                  <span className="sb-sub">{item.sub}</span>
                </div>
                <ChevronRight size={13} className="sb-arrow" />
              </button>
            ))}
          </div>

          <div className="sb-footer">
            <div className="sb-city">Bengaluru</div>
          </div>
        </nav>

        {/* ── Topbar ── */}
        <div className="topbar">
          <button className="topbar-btn" onClick={() => setSbOpen(v => !v)}>
            {sbOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="topbar-picon" style={{ color: nav.accent }}>{nav.icon}</div>
          <div>
            <div className="topbar-ptitle">{nav.label}</div>
          </div>
          <div className="topbar-sep" />
          <span className="topbar-psub">{nav.sub}</span>
          <div className="topbar-right">
            <span className="topbar-count">
              {NAV_ITEMS.findIndex(n => n.id === page) + 1} / {NAV_ITEMS.length}
            </span>
          </div>
        </div>

        {/* ── Page body ── */}
        <div className="pbody">
          <div className="pinner">

            {/* ═══════════════ OVERVIEW ═══════════════ */}
            {page === "overview" && (
              <div key="ov">
                <div className="phero" style={{ "--hglow": "rgba(201,168,76,.1)" } as React.CSSProperties}>
                  <div className="phero-wm">LIVE</div>
                  <div className="phero-inner">
                    <div className="phero-left">
                      <div className="phero-iw"><LayoutDashboard /></div>
                      <div className="phero-txt">
                        <h2>Traffic Overview</h2>
                        <p>Live congestion hotspot map for Bangalore. Visualize real-time traffic intensity across the city at a glance.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="g3" style={{ marginBottom:"1.5rem" }}>
                  {[
                    { lbl:"Active Zones",  val:"12", sub:"Congestion hotspots", clr:"#c9a84c", tg:"rgba(201,168,76,.12)" },
                    { lbl:"Avg. Speed",    val:"24", sub:"km/h city-wide",      clr:"#34d399", tg:"rgba(52,211,153,.12)"  },
                    { lbl:"Incidents",     val:"3",  sub:"Reported today",      clr:"#f87171", tg:"rgba(248,113,113,.12)" },
                  ].map((s,i) => (
                    <div key={i} className="stile" style={{ "--tglow": s.tg } as React.CSSProperties}>
                      <div className="stile-lbl">{s.lbl}</div>
                      <div className="stile-val" style={{ color: s.clr }}>{s.val}</div>
                      <div className="stile-sub">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ marginBottom:"1.25rem" }}>
                  <div className="stitle"><MapPin />Traffic Hotspot Map</div>
                  <div className="ssub">Live congestion visualization — click any zone for details</div>
                  <div className="mw">
                    <HotspotMap location={location} prediction={prediction} anomaly={anomaly} setLocation={setLocation} />
                  </div>
                </div>

                <div className="orn"><div className="orn-l"/><div className="orn-d"/><div className="orn-l"/></div>

                <div className="card">
                  <div className="ch">
                    <div className="ca" />
                    <span className="ct">Your Current Location</span>
                    <div className="ci" style={{ color:"#34d399" }}><MapPin /></div>
                  </div>
                  <LocationTraffic />
                </div>
              </div>
            )}

            {/* ═══════════════ PREDICTION ═══════════════ */}
            {page === "predict" && (
              <div key="pr">
                <div className="phero" style={{ "--hglow": "rgba(96,165,250,.1)" } as React.CSSProperties}>
                  <div className="phero-wm">AI</div>
                  <div className="phero-inner">
                    <div className="phero-left">
                      <div className="phero-iw" style={{ borderColor:"rgba(96,165,250,.35)" }}>
                        <TrendingUp style={{ color:"#60a5fa" }} />
                      </div>
                      <div className="phero-txt">
                        <h2>AI Congestion Prediction</h2>
                        <p>Enter coordinates and time parameters to receive a machine-learning-based traffic forecast with anomaly detection.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="gsb">
                  <div className="card" style={{ "--csh":"rgba(96,165,250,.2)" } as React.CSSProperties}>
                    <div className="ch">
                      <div className="ca" style={{ background:"linear-gradient(180deg,#60a5fa 0%,rgba(96,165,250,.15) 100%)" }} />
                      <span className="ct">Prediction Engine</span>
                    </div>
                    <PredictForm location={location} setLocation={setLocation} setPrediction={setPrediction} setAnomaly={setAnomaly} />
                  </div>

                  <div className="sy">
                    <div className="card">
                      <div className="stitle"><Activity />Prediction Map</div>
                      <div className="ssub">Forecast visualized on the city map</div>
                      <div className="mw">
                        <HotspotMap location={location} prediction={prediction} anomaly={anomaly} setLocation={setLocation} />
                      </div>
                    </div>

                    {prediction && (
                      <div className="g2">
                        <div className="stile" style={{ "--tglow":"rgba(96,165,250,.12)" } as React.CSSProperties}>
                          <div className="stile-lbl">Congestion Level</div>
                          <div className="stile-val" style={{ color:"#60a5fa" }}>{prediction.level}</div>
                          <div className="stile-sub">Predicted intensity</div>
                        </div>
                        <div className="stile" style={{ "--tglow":"rgba(248,113,113,.12)" } as React.CSSProperties}>
                          <div className="stile-lbl">Anomaly Severity</div>
                          <div className="stile-val" style={{ color: anomaly ? "#f87171" : "#34d399" }}>
                            {anomaly ? anomaly.severity : "—"}
                          </div>
                          <div className="stile-sub">{anomaly ? "Anomaly detected" : "No anomaly"}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ ROUTES ═══════════════ */}
            {page === "routes" && (
              <div key="rt">
                <div className="phero" style={{ "--hglow": "rgba(52,211,153,.1)" } as React.CSSProperties}>
                  <div className="phero-wm">ROUTE</div>
                  <div className="phero-inner">
                    <div className="phero-left">
                      <div className="phero-iw" style={{ borderColor:"rgba(52,211,153,.35)" }}>
                        <Navigation style={{ color:"#34d399" }} />
                      </div>
                      <div className="phero-txt">
                        <h2>Route-Level Congestion</h2>
                        <p>Click two points on the map to define your route. The system analyses predicted congestion along every segment.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card" style={{ "--csh":"rgba(52,211,153,.2)" } as React.CSSProperties}>
                  <div className="stitle"><Navigation style={{ color:"#34d399" }} />Interactive Route Map</div>
                  <div className="ssub">Select source → destination to compute route congestion</div>
                  <RouteMap />
                </div>
              </div>
            )}

            {/* ═══════════════ TRANSIT ═══════════════ */}
            {page === "transit" && <TransitPage />}

            {/* ═══════════════ VISION AI ═══════════════ */}
            {page === "vision" && (
              <div key="vi">
                <div className="phero" style={{ "--hglow": "rgba(167,139,250,.1)" } as React.CSSProperties}>
                  <div className="phero-wm">VISION</div>
                  <div className="phero-inner">
                    <div className="phero-left">
                      <div className="phero-iw" style={{ borderColor:"rgba(167,139,250,.35)" }}>
                        <Camera style={{ color:"#a78bfa" }} />
                      </div>
                      <div className="phero-txt">
                        <h2>Vision AI Analysis</h2>
                        <p>Upload a traffic image or use your webcam to run computer-vision congestion detection in real time.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="g2" style={{ marginBottom:"1.25rem" }}>
                  <div className="card" style={{ "--csh":"rgba(167,139,250,.2)" } as React.CSSProperties}>
                    <div className="ch">
                      <div className="ca" style={{ background:"linear-gradient(180deg,#a78bfa 0%,rgba(167,139,250,.15) 100%)" }} />
                      <span className="ct">Upload Image</span>
                      <div className="ci" style={{ color:"#a78bfa" }}><Image size={15} /></div>
                    </div>
                    <ImageUpload onResult={setTrafficImageData} />
                  </div>
                  <div className="card" style={{ "--csh":"rgba(96,165,250,.2)" } as React.CSSProperties}>
                    <div className="ch">
                      <div className="ca" style={{ background:"linear-gradient(180deg,#60a5fa 0%,rgba(96,165,250,.15) 100%)" }} />
                      <span className="ct">Webcam Capture</span>
                    </div>
                    <WebcamCapture onResult={setTrafficImageData} />
                  </div>
                </div>

                {trafficImageData && (
                  <>
                    <div className="orn">
                      <div className="orn-l"/><div className="orn-d" style={{ background:"#a78bfa" }}/><div className="orn-l"/>
                    </div>
                    <div className="card" style={{ marginBottom:"1.25rem" }}>
                      <TrafficResult data={trafficImageData} />
                    </div>
                    <div className="card" style={{ "--csh":"rgba(167,139,250,.18)" } as React.CSSProperties}>
                      <div className="stitle"><MapPin />Detection Map</div>
                      <div className="mw"><MapView data={trafficImageData} /></div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══════════════ SMART MODE ═══════════════ */}
            {page === "smart" && (
              <div key="sm">
                <div className="phero" style={{ "--hglow": "rgba(251,146,60,.1)" } as React.CSSProperties}>
                  <div className="phero-wm">SMART</div>
                  <div className="phero-inner">
                    <div className="phero-left">
                      <div className="phero-iw" style={{ borderColor:"rgba(251,146,60,.35)" }}>
                        <Zap style={{ color:"#fb923c" }} />
                      </div>
                      <div className="phero-txt">
                        <h2>Smart Mode</h2>
                        <p>Adaptive recommendations that synthesise live data across all sources to suggest the optimal travel strategy.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card" style={{ "--csh":"rgba(251,146,60,.2)" } as React.CSSProperties}>
                  <SmartModeCard />
                </div>
              </div>
            )}

            {/* ═══════════════ EXPLORE NEARBY ═══════════════ */}
            {page === "explore" && (
              <div key="ex">
                <div className="phero" style={{ "--hglow": "rgba(34,211,238,.1)" } as React.CSSProperties}>
                  <div className="phero-wm">EXPLORE</div>
                  <div className="phero-inner">
                    <div className="phero-left">
                      <div className="phero-iw" style={{ borderColor:"rgba(34,211,238,.35)" }}>
                        <Compass style={{ color:"#22d3ee" }} />
                      </div>
                      <div className="phero-txt">
                        <h2>Explore Nearby</h2>
                        <p>Discover restaurants, hospitals, parking, and more near your current location with GPS-powered recommendations.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {userGps && (
                  <div className="g3" style={{ marginBottom:"1.5rem" }}>
                    <div className="stile" style={{ "--tglow":"rgba(34,211,238,.12)" } as React.CSSProperties}>
                      <div className="stile-lbl">Your Location</div>
                      <div className="stile-val" style={{ color:"#22d3ee", fontSize:"1.2rem" }}>
                        {userGps.lat.toFixed(4)}°N
                      </div>
                      <div className="stile-sub">{userGps.lng.toFixed(4)}°E</div>
                    </div>
                    <div className="stile" style={{ "--tglow":"rgba(52,211,153,.12)" } as React.CSSProperties}>
                      <div className="stile-lbl">GPS Status</div>
                      <div className="stile-val" style={{ color:"#34d399" }}>✓</div>
                      <div className="stile-sub">Location acquired</div>
                    </div>
                    <div className="stile" style={{ "--tglow":"rgba(251,146,60,.12)" } as React.CSSProperties}>
                      <div className="stile-lbl">Search Radius</div>
                      <div className="stile-val" style={{ color:"#fb923c" }}>5</div>
                      <div className="stile-sub">kilometers</div>
                    </div>
                  </div>
                )}

                <div className="card" style={{ "--csh":"rgba(34,211,238,.2)" } as React.CSSProperties}>
                  <div className="ch">
                    <div className="ca" style={{ background:"linear-gradient(180deg,#22d3ee 0%,rgba(34,211,238,.15) 100%)" }} />
                    <span className="ct">Places Discovery</span>
                    <div className="ci" style={{ color:"#22d3ee" }}><Compass /></div>
                  </div>
                  {userGps ? (
                    <ExploreNearby defaultLat={userGps.lat} defaultLng={userGps.lng} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400">📍 Getting your location...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

// ─── Transit sub-page ─────────────────────────────────────────────────────────
type TTab = "metro" | "bus" | "stops" | "rail";

const TTABS: { id: TTab; label: string; icon: React.ReactNode; accent: string }[] = [
  { id:"metro", label:"Metro",         icon:<Train size={13}/>,      accent:"#f472b6" },
  { id:"bus",   label:"Bus Planner",   icon:<Bus size={13}/>,        accent:"#60a5fa" },
  { id:"stops", label:"Nearest Stop",  icon:<MapPin size={13}/>,     accent:"#34d399" },
  { id:"rail",  label:"Railway",       icon:<Navigation size={13}/>, accent:"#fbbf24" },
];

const TransitPage: React.FC = () => {
  const [tab, setTab] = useState<TTab>("metro");
  const cur = TTABS.find(t => t.id === tab)!;

  return (
    <div key="tr">
      <div className="phero" style={{ "--hglow": "rgba(244,114,182,.1)" } as React.CSSProperties}>
        <div className="phero-wm">TRANSIT</div>
        <div className="phero-inner">
          <div className="phero-left">
            <div className="phero-iw" style={{ borderColor:"rgba(244,114,182,.35)" }}>
              <Train style={{ color:"#f472b6" }} />
            </div>
            <div className="phero-txt">
              <h2>Transit Hub</h2>
              <p>Plan journeys across Bangalore's metro, bus, and railway networks. Find nearest stops and optimal interchange routes.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ttabs">
        {TTABS.map(t => (
          <button key={t.id} className={`ttab ${tab === t.id ? "on" : ""}`}
            style={tab === t.id ? { color: t.accent, borderColor:`${t.accent}55` } : {}}
            onClick={() => setTab(t.id)}>
            <span style={{ color: t.accent }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{
        "--csh": `${cur.accent}33`,
        animation: "fsi .3s ease both",
      } as React.CSSProperties}>
        <div className="ch">
          <div className="ca" style={{ background:`linear-gradient(180deg,${cur.accent} 0%,${cur.accent}22 100%)` }} />
          <span className="ct">{cur.label}</span>
          <div className="ci" style={{ color: cur.accent }}>{cur.icon}</div>
        </div>
        {tab === "metro" && <MetroPlanner />}
        {tab === "bus"   && <BusPlanner />}
        {tab === "stops" && <NearestBusStop />}
        {tab === "rail"  && <RailwayPlanner />}
      </div>
    </div>
  );
};

export default Dashboard;
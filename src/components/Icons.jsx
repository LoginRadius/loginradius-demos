// Lucide-style icon set used across the demo.
// Exported as a single I.* namespace to match the design artifact's pattern.

const base = (props) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props,
});

export const I = {
  Helix: (p) => (
    <svg {...base({ width: 16, height: 16, strokeWidth: 2, ...p })}>
      <path d="M5 4c4 2 10 2 14 0" />
      <path d="M5 20c4-2 10-2 14 0" />
      <path d="M5 4c0 4 14 12 14 16" />
      <path d="M19 4C19 8 5 16 5 20" />
    </svg>
  ),
  Chev: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 2, ...p })}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevUpDown: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 2, ...p })}>
      <polyline points="7 15 12 20 17 15" />
      <polyline points="7 9 12 4 17 9" />
    </svg>
  ),
  Search: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 2, ...p })}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Plus: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 2, ...p })}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  More: (p) => (
    <svg {...base({ width: 16, height: 16, strokeWidth: 2, ...p })}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
  Check: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 2.5, ...p })}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 2, ...p })}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Bell: (p) => (
    <svg {...base({ width: 16, height: 16, strokeWidth: 2, ...p })}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Help: (p) => (
    <svg {...base({ width: 16, height: 16, strokeWidth: 2, ...p })}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Book: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 2, ...p })}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Home: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <path d="M3 9.5 12 3l9 6.5V21H3z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  Users: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shield: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Plug: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <path d="M12 22v-5" />
      <path d="M9 7V2" />
      <path d="M15 7V2" />
      <path d="M6 13V8h12v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" />
    </svg>
  ),
  Lock: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Mail: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Globe: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Sync: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
      <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
    </svg>
  ),
  Settings: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Alert: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Trash: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Key: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Copy: (p) => (
    <svg {...base({ width: 13, height: 13, strokeWidth: 1.8, ...p })}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Download: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Refresh: (p) => (
    <svg {...base({ width: 13, height: 13, strokeWidth: 1.8, ...p })}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  ExternalLink: (p) => (
    <svg {...base({ width: 12, height: 12, strokeWidth: 1.8, ...p })}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Eye: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  TrendUp: (p) => (
    <svg {...base({ width: 12, height: 12, strokeWidth: 2, ...p })}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  LogOut: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Contact: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Briefcase: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  BarChart: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  Person: (p) => (
    <svg {...base({ width: 15, height: 15, strokeWidth: 1.8, ...p })}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Dollar: (p) => (
    <svg {...base({ width: 12, height: 12, strokeWidth: 2, ...p })}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

// Profile-page-only icons. Kept here (not in the global I.* namespace) so the
// global icon set stays focused on the workspace chrome.

const base = (p) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...p,
});

export const PI = {
  Camera: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Pencil: (p) => (
    <svg {...base({ width: 13, height: 13, strokeWidth: 1.8, ...p })}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  AtSign: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  ),
  Phone: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Smartphone: (p) => (
    <svg {...base({ width: 14, height: 14, strokeWidth: 1.8, ...p })}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Finger: (p) => (
    <svg {...base({ width: 16, height: 16, strokeWidth: 1.8, ...p })}>
      <path d="M12 11v3a2 2 0 0 1-2 2" />
      <path d="M3 9a9 9 0 0 1 18 0" />
      <path d="M3 14a9 9 0 0 0 14 7" />
      <path d="M7 9a5 5 0 0 1 10 0v6" />
      <path d="M21 14v1a6 6 0 0 1-6 6" />
    </svg>
  ),
};

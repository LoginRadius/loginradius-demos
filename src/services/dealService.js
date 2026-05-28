export const STAGES = ["Prospect", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export const deals = [
  { id: "d001", name: "Acme Pay — Enterprise Upgrade", company: "Acme Pay", contact: "James Harrington", value: 48000, stage: "Proposal", owner: "Aria Chen", ownerInitials: "AC", ownerColor: "#1E5DDB", probability: 70, closeDate: "Jun 30, 2026", createdAt: "Apr 2, 2026" },
  { id: "d002", name: "Globex Logistics — SCIM + SSO Bundle", company: "Globex Logistics", contact: "Sophia Müller", value: 32000, stage: "Negotiation", owner: "Marcus Wong", ownerInitials: "MW", ownerColor: "#7c3aed", probability: 85, closeDate: "May 28, 2026", createdAt: "Mar 18, 2026" },
  { id: "d003", name: "Initech — Starter Conversion", company: "Initech", contact: "Ravi Patel", value: 9600, stage: "Qualified", owner: "Priya Sharma", ownerInitials: "PS", ownerColor: "#db2777", probability: 45, closeDate: "Jul 15, 2026", createdAt: "Apr 25, 2026" },
  { id: "d004", name: "Meridian Fintech — Annual Contract", company: "Meridian Fintech", contact: "Claire Fontaine", value: 72000, stage: "Closed Won", owner: "Aria Chen", ownerInitials: "AC", ownerColor: "#1E5DDB", probability: 100, closeDate: "May 1, 2026", createdAt: "Feb 10, 2026" },
  { id: "d005", name: "Stacklabs — Business Plan", company: "Stacklabs", contact: "Tom Bakker", value: 14400, stage: "Closed Lost", owner: "Marcus Wong", ownerInitials: "MW", ownerColor: "#7c3aed", probability: 0, closeDate: "Apr 20, 2026", createdAt: "Mar 5, 2026" },
  { id: "d006", name: "Crestwave Systems — Trial to Paid", company: "Crestwave Systems", contact: "Amara Diallo", value: 19200, stage: "Prospect", owner: "Priya Sharma", ownerInitials: "PS", ownerColor: "#db2777", probability: 20, closeDate: "Aug 1, 2026", createdAt: "May 10, 2026" },
  { id: "d007", name: "PulseHQ — Business Renewal", company: "PulseHQ", contact: "Lucas Ferreira", value: 18000, stage: "Qualified", owner: "Aria Chen", ownerInitials: "AC", ownerColor: "#1E5DDB", probability: 60, closeDate: "Jul 31, 2026", createdAt: "Apr 14, 2026" },
  { id: "d008", name: "VantaCore — Enterprise SAML", company: "VantaCore", contact: "Nadia Al-Hassan", value: 56000, stage: "Proposal", owner: "Marcus Wong", ownerInitials: "MW", ownerColor: "#7c3aed", probability: 65, closeDate: "Jun 15, 2026", createdAt: "Apr 8, 2026" },
];

export const dealService = {
  list: async () => deals,
  byStage: async (stage) => deals.filter((d) => d.stage === stage),
  get: async (id) => deals.find((d) => d.id === id),
  pipeline: () => {
    const active = deals.filter((d) => d.stage !== "Closed Lost");
    return {
      total: active.length,
      value: active.reduce((s, d) => s + d.value, 0),
      weighted: active.reduce((s, d) => s + d.value * (d.probability / 100), 0),
      byStage: STAGES.slice(0, 4).map((stage) => ({
        stage,
        deals: deals.filter((d) => d.stage === stage),
        value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.value, 0),
      })),
    };
  },
};

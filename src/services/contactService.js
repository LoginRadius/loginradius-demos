export const contacts = [
  { id: "c001", name: "James Harrington", email: "j.harrington@acmepay.io", company: "Acme Pay", status: "active", owner: "Aria Chen", ownerInitials: "AC", ownerColor: "#1E5DDB", lastContact: "Today", tags: ["Enterprise"] },
  { id: "c002", name: "Sophia Müller", email: "s.muller@globex.de", company: "Globex Logistics", status: "active", owner: "Marcus Wong", ownerInitials: "MW", ownerColor: "#7c3aed", lastContact: "Yesterday", tags: ["SAML", "SCIM"] },
  { id: "c003", name: "Ravi Patel", email: "ravi.p@initech.co", company: "Initech", status: "lead", owner: "Priya Sharma", ownerInitials: "PS", ownerColor: "#db2777", lastContact: "2 days ago", tags: ["Trial"] },
  { id: "c004", name: "Claire Fontaine", email: "c.fontaine@meridian.fr", company: "Meridian Fintech", status: "active", owner: "Aria Chen", ownerInitials: "AC", ownerColor: "#1E5DDB", lastContact: "3 days ago", tags: ["Enterprise", "SSO"] },
  { id: "c005", name: "Tom Bakker", email: "t.bakker@stacklabs.nl", company: "Stacklabs", status: "inactive", owner: "Marcus Wong", ownerInitials: "MW", ownerColor: "#7c3aed", lastContact: "2 weeks ago", tags: ["Starter"] },
  { id: "c006", name: "Amara Diallo", email: "amara@crestwave.ng", company: "Crestwave Systems", status: "lead", owner: "Priya Sharma", ownerInitials: "PS", ownerColor: "#db2777", lastContact: "Today", tags: ["Trial"] },
  { id: "c007", name: "Lucas Ferreira", email: "l.ferreira@pulsehq.br", company: "PulseHQ", status: "active", owner: "Aria Chen", ownerInitials: "AC", ownerColor: "#1E5DDB", lastContact: "5 days ago", tags: ["Business"] },
  { id: "c008", name: "Nadia Al-Hassan", email: "nadia@vantacore.ae", company: "VantaCore", status: "active", owner: "Marcus Wong", ownerInitials: "MW", ownerColor: "#7c3aed", lastContact: "1 week ago", tags: ["Enterprise", "SAML"] },
  { id: "c009", name: "Oliver Grant", email: "o.grant@brickwork.io", company: "Brickwork", status: "inactive", owner: "Priya Sharma", ownerInitials: "PS", ownerColor: "#db2777", lastContact: "3 weeks ago", tags: ["Starter"] },
  { id: "c010", name: "Yuna Park", email: "yuna@novafin.kr", company: "NovaFin", status: "lead", owner: "Aria Chen", ownerInitials: "AC", ownerColor: "#1E5DDB", lastContact: "Today", tags: ["Trial", "SSO"] },
];

export const contactService = {
  list: async () => contacts,
  get: async (id) => contacts.find((c) => c.id === id),
  stats: () => ({
    total: contacts.length,
    active: contacts.filter((c) => c.status === "active").length,
    leads: contacts.filter((c) => c.status === "lead").length,
    inactive: contacts.filter((c) => c.status === "inactive").length,
  }),
};

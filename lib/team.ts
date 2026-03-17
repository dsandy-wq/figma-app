export type TeamMember = {
  name:  string;
  email: string;
};

export const TEAM: TeamMember[] = [
  { name: "Sarah M.", email: "sarah@dbhalo.com" },
  { name: "James T.", email: "james@dbhalo.com" },
  { name: "Lee R.",   email: "lee@dbhalo.com"   },
];

export const TEAM_MEMBERS = TEAM.map((t) => t.name);

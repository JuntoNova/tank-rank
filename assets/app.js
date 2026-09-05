const fmtPct = (n) => `${Math.round(n * 100)}%`;
const bucketLabel = { college: "College", "high-school": "High School", international: "International" };

function currentYear() {
  return TANK_RANK.currentYear;
}

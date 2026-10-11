/* ============================================================
   BOSS BATTLE QUIZ — GAME DATA
   ------------------------------------------------------------
   With "all questions must appear" mode:
   - The game uses ALL questions before it can end
   - Boss HP is calculated to survive until the last question
   - If the boss survives, Sudden Death resolves the tie
   ============================================================ */

/* ---------- GLOBAL GAMEPLAY BALANCE ---------- */
const GAME_CONFIG = {
  DAMAGE_TAKEN: 15,           // HP lost per wrong answer
  STREAK_BONUS_PER_HIT: 2,    // Extra damage per streak level
  MAX_STREAK_BONUS: 8,        // Cap on streak bonus damage
  HEAL_EVERY_N_CORRECT: 3,    // Heal available every N correct answers
  TYPEWRITER_SPEED: 14,       // ms per character during story

  /* ---------- TIMER SETTINGS ---------- */
  TIME_PER_QUESTION: 20,
  TIME_AUTO_SCALE: true,
  TIME_PER_CHAR: 0.08,
  TIME_MIN: 12,
  TIME_MAX: 45,

  /* ---------- ALL-QUESTIONS MODE ----------
     When true:
     - The game will use every question before ending
     - Boss HP is calculated to survive until the last question
     - Sudden Death resolves if boss survives
  */
  ALL_QUESTIONS_MODE: true
};

/* ---------- THE BOSS ---------- */
const BOSS = {
  name: "The Elder Dragon",
  emoji: "🐉",
  hp: 100        // Ignored in ALL_QUESTIONS_MODE — computed dynamically
};

/* ---------- PLAYABLE CHARACTERS ---------- */
const CHARACTERS = [
  { id: "knight",  emoji: "🛡️", name: "The Knight",  desc: "Stalwart defender. Extra health.", hp: 130, damage: 18, heal: 30, hpMult: 0.85 },
  { id: "duelist", emoji: "⚔️", name: "The Duelist", desc: "Balanced fighter.",                hp: 100, damage: 22, heal: 25, hpMult: 1.0  },
  { id: "mage",    emoji: "🧙", name: "The Mage",    desc: "Fragile but devastating.",         hp: 75,  damage: 32, heal: 20, hpMult: 1.3  },
  { id: "archer",  emoji: "🏹", name: "The Archer",  desc: "Fast and precise.",                hp: 90,  damage: 25, heal: 22, hpMult: 1.1  },
  { id: "rogue",   emoji: "🗡️", name: "The Rogue",   desc: "Relentless striker.",              hp: 85,  damage: 30, heal: 15, hpMult: 1.25 },
  { id: "oracle",  emoji: "🔮", name: "The Oracle",  desc: "Mystic healer.",                   hp: 95,  damage: 20, heal: 40, hpMult: 1.0  }
];

/* ---------- QUIZ QUESTIONS ----------
   ⚠️ a[0] is ALWAYS the correct answer.
   OPTIONAL: time: 30 — custom seconds for that question
*/
const QUESTIONS = [
  {
    q: "Which activity in Financial Management for IT Services is responsible for predicting the expected future requirements for funds to deliver agreed services and monitoring adherence to defined budgets?",
    a: ["Budgeting", "Accounting", "Chargeback", "Demand Modeling"]
  },
  {
    q : "Financial Management ensures that the charges for IT services are transparent and easily understood by the business.",
    a: ["True", "False"]
  },
  {
    q: "A company buys 50 laptops and 10 servers for its new branch. What type of tangible IT cost is this?",
    a: ["Hardware & Infrastructure", "Software & Subscriptions", "Personnel & Services", "Intangible IT Cost"]
  },
  {
    q: "An IT firm renews its Microsoft 365 subscription and Windows enterprise licenses annually. What type of tangible IT cost is this?",
    a: ["Software & Subscriptions", "Hardware & Infrastructure", "Personnel & Services", "Intangible IT Cost"]
  },
  {
    q: "A company pays monthly salaries to its helpdesk technicians and system administrators. What type of tangible IT cost is this?",
    a: ["Personnel & Services", "Hardware & Infrastructure", "Software & Subscriptions", "Intangible IT Cost"]
  },
  {
    q: "What is an example of employee downtime as an intangible IT cost?",
    a: ["Losing working hours because a system crashes", "Purchasing new computer equipment", "Paying monthly software subscription fees", "Buying additional storage devices"]
  },
  {
    q: "What does learning curve lag mean?",
    a: ["Employees take longer to complete tasks while learning new software", "Employees complete tasks faster after training", "A company reduces its IT expenses", "A system automatically updates its features"]
  },
  {
    q: "What is a possible effect of user frustration caused by difficult-to-use IT tools?",
    a: ["Lower employee morale and increased mental stress", "Higher employee morale", "Improved system performance", " Reduced software costs"]
  },
  {
    q: "Provisioning value refers to the actual underlying costs of IT, which only includes tangible expenses and excludes intangible expenses.",
    a: ["False", "True"]
  },
  {
    q: "Service value potential is the value-adding component based on the customer's value perception or expected additional utility and warranty compared to their own assets.",
    a: ["True", "False"]
  },
  {
    q: "Employee downtime caused by system crashes is considered a tangible IT cost because it directly affects daily working hours.",
    a: ["False", "True"]
  },
  {
    q: "A company invests RM500,000 into new IT infrastructure and sets an operational budget for the year. What type of financial input is this?",
    a: ["Capital and Funds", "Resources", "Data", "Returns and Profitability"]
  },
  {
    q: " The IT department assigns 200 staff-hours and uses existing servers to build a new service. What type of financial input does this represent?",
    a: ["Resources", "Capital and Funds", "Data", "Financial Statements"]
  },
  {
    q: "At the end of the quarter, the CFO presents a balance sheet and cash flow statement to the board. What type of financial output is this?",
    a: ["Financial Statements", "Returns and Profitability", "Resources", "Data"]
  },
  {
    q: " A service provider defines one SLA for all customers covering email services, and another SLA covering network services. What type of SLA structure is this?",
    a: ["Service-level SLA", "Multi-level SLA", " Single-level SLA", "Customer-level SLA"]
  },
  {
    q: "A Customer-level SLA is designed for a specific department or business unit within an organization.",
    a: ["True", "False"]
  },
  {
    q: "A bank has a general SLA for all branches, but also has a separate SLA specifically for its online banking platform. What type of SLA structure is this?",
    a: ["Multi-level SLA", "Single-level SLA", "Service-level SLA", "Customer-level SLA"]
  }
];

/* ---------- BOSS VISUAL STAGES ---------- */
const BOSS_STAGES = [
  { minHp: 0.7,  stage: 1, label: "Healthy" },
  { minHp: 0.4,  stage: 2, label: "Wounded" },
  { minHp: 0.15, stage: 3, label: "Critical" },
  { minHp: 0,    stage: 4, label: "Near Death" }
];

/* ---------- ENDINGS ---------- */
const ENDINGS = {
  win:  { emoji: "🏆", title: "Epilogue — The Dawn Returns", text: "" },
  lose: { emoji: "💀", title: "Epilogue — The Silence",      text: "" }
};

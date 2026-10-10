/* ============================================================
   BOSS BATTLE QUIZ — GAME DATA
   ------------------------------------------------------------
   Edit this file to customize:
     • GAME_CONFIG  → gameplay balance
     • BOSS         → boss name & emoji
     • CHARACTERS   → playable heroes and their stats
     • QUESTIONS    → your quiz questions
     • BOSS_STAGES  → HP-based stage labels
     • ENDINGS      → victory / defeat story text
   ============================================================ */

/* ---------- GLOBAL GAMEPLAY BALANCE ---------- */
const GAME_CONFIG = {
  DAMAGE_TAKEN: 15,           // HP lost per wrong answer
  STREAK_BONUS_PER_HIT: 4,    // Extra damage per streak level
  MAX_STREAK_BONUS: 20,       // Cap on streak bonus damage
  HEAL_EVERY_N_CORRECT: 3,    // Heal available every N correct answers
  TYPEWRITER_SPEED: 14,       // ms per character during story

  /* ---------- TIMER SETTINGS ----------
     TIME_PER_QUESTION:  Base seconds per question (used if a
                         question has no custom "time" field)
     TIME_AUTO_SCALE:    If true, base time is automatically
                         extended based on question length.
                         Longer questions get more time.
     TIME_PER_CHAR:      Extra seconds added per character
                         (only used when TIME_AUTO_SCALE = true)
     TIME_MIN:           Minimum seconds per question
     TIME_MAX:           Maximum seconds per question
  */
  TIME_PER_QUESTION: 15,
  TIME_AUTO_SCALE: true,
  TIME_PER_CHAR: 0.08,
  TIME_MIN: 10,
  TIME_MAX: 45
};

/* ---------- THE BOSS ---------- */
const BOSS = {
  name: "The Boss",
  emoji: "👹",
  hp: 100
};

/* ---------- PLAYABLE CHARACTERS ---------- */
const CHARACTERS = [
  { id: "knight",  emoji: "🛡️", name: "The Knight",  desc: "Stalwart defender. Extra health.",        hp: 130, damage: 18, heal: 30, hpMult: 1.0  },
  { id: "duelist", emoji: "⚔️", name: "The Duelist", desc: "Balanced fighter. Strong all-around.",    hp: 100, damage: 22, heal: 25, hpMult: 1.0  },
  { id: "mage",    emoji: "🧙", name: "The Mage",    desc: "Fragile but devastating.",                hp: 75,  damage: 32, heal: 20, hpMult: 0.9  },
  { id: "archer",  emoji: "🏹", name: "The Archer",  desc: "Fast and precise.",                       hp: 90,  damage: 25, heal: 22, hpMult: 1.0  },
  { id: "rogue",   emoji: "🗡️", name: "The Rogue",   desc: "Relentless striker. Heavy damage.",       hp: 85,  damage: 30, heal: 15, hpMult: 1.05 },
  { id: "oracle",  emoji: "🔮", name: "The Oracle",  desc: "Mystic healer. Best recovery.",           hp: 95,  damage: 20, heal: 40, hpMult: 1.0  }
];

/* ---------- QUIZ QUESTIONS ----------
   ⚠️  a[0] is ALWAYS the correct answer.
   The game shuffles answers at runtime.

   OPTIONAL fields per question:
     time:  Custom seconds for this specific question.
            Overrides auto-scaling. Example: time: 30

   If "time" is omitted AND TIME_AUTO_SCALE is true,
   the timer scales automatically based on question + answer length.
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
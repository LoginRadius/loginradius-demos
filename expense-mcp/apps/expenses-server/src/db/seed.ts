import "dotenv/config";
import { getDb, closeDb, isDatabaseInitialized } from "@/db/index.js";
import { createTables } from "@/db/schema.js";
import { generateUUID } from "@/utils/uuid.js";
import { DEFAULT_CATEGORIES } from "@/config/constants.js";

/**
 * Seeds the expense categories and the first administrator.
 *
 * Everyone else arrives on their own: the server creates a local profile the
 * first time a LoginRadius account signs in. What it cannot bootstrap is the
 * first finance admin, because assigning someone a department and a manager is
 * itself a finance-admin action. That one account is seeded here.
 *
 * No sample expenses are created — they are submitted through the app.
 *
 * Re-running is safe: every insert is keyed on the LoginRadius UID or the email
 * and skipped if it already exists.
 */

interface SeedUser {
  /** Email of the account, exactly as entered in the LoginRadius dashboard. */
  email: string;
  /**
   * The account's LoginRadius UID, from Users > Manage Users > (the user).
   * Links this row to the LoginRadius account on first sign-in.
   */
  lrUserId: string;
  fullName: string;
  /** Without one, the user cannot submit, approve or list team expenses. */
  department: string;
  /** Email of this user's manager, if they also appear in this list. */
  managerEmail?: string;
}

// ---------------------------------------------------------------------------
// EDIT THIS. Replace the placeholder with the account you created in the
// LoginRadius dashboard and gave the `expense-finance` role to, then run
// `pnpm run db:seed`. See SETUP.md, "Seed the database".
//
// Add more entries if you created more accounts. Anyone omitted here can still
// sign in — they simply arrive with no department until this user assigns one
// from the Users screen.
// ---------------------------------------------------------------------------
const SEED_USERS: SeedUser[] = [
  {
    email: "finance@example.com",
    lrUserId: "REPLACE_WITH_THE_LOGINRADIUS_UID",
    fullName: "Finance Admin",
    department: "Finance",
  },
];

function seedCategories(): void {
  const db = getDb();

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO expense_categories
    (category_name, description, requires_receipt, max_amount)
    VALUES (?, ?, ?, ?)
  `);

  for (const category of DEFAULT_CATEGORIES) {
    insertCategory.run(
      category.name,
      category.description,
      category.requiresReceipt ? 1 : 0,
      category.maxAmount,
    );
  }

  console.log(`✅ ${DEFAULT_CATEGORIES.length} expense categories`);
}

function seedUsers(): void {
  const db = getDb();

  if (SEED_USERS.some((user) => user.lrUserId.startsWith("REPLACE_WITH"))) {
    console.error(
      "\n❌ SEED_USERS in src/db/seed.ts still holds the placeholder UID.\n" +
        "   Put the email and LoginRadius UID of the account you gave the\n" +
        "   expense-finance role to there first. See SETUP.md.\n",
    );
    process.exit(1);
  }

  const findExisting = db.prepare(
    "SELECT user_id FROM users WHERE lr_user_id = ? OR email = ?",
  );
  const insert = db.prepare(`
    INSERT INTO users (user_id, email, full_name, department, manager_id, lr_user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const user of SEED_USERS) {
    if (findExisting.get(user.lrUserId, user.email)) {
      console.log(`↷ ${user.email} already present, left untouched`);
      continue;
    }

    insert.run(
      generateUUID(),
      user.email,
      user.fullName,
      user.department,
      null,
      user.lrUserId,
    );
    console.log(`✅ ${user.email} (${user.department})`);
  }

  // Second pass, so a manager may be listed after the people reporting to them.
  const idForEmail = db.prepare("SELECT user_id FROM users WHERE email = ?");
  const setManager = db.prepare(
    "UPDATE users SET manager_id = ? WHERE email = ?",
  );

  for (const user of SEED_USERS) {
    if (!user.managerEmail) continue;

    const manager = idForEmail.get(user.managerEmail) as
      | { user_id: string }
      | undefined;

    if (!manager) {
      console.warn(
        `⚠ manager ${user.managerEmail} for ${user.email} is not in SEED_USERS — skipped`,
      );
      continue;
    }

    setManager.run(manager.user_id, user.email);
    console.log(`✅ ${user.email} reports to ${user.managerEmail}`);
  }
}

async function seed(): Promise<void> {
  console.log("\n🌱 Seeding…\n");

  if (!isDatabaseInitialized()) {
    createTables();
  }

  seedCategories();
  seedUsers();

  const db = getDb();
  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number }).c;

  console.log(
    `\n📊 ${count("users")} users, ${count("expense_categories")} categories\n`,
  );
  console.log(
    "Sign in at http://localhost:5173 as the seeded account to administer the rest.\n",
  );

  closeDb();
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

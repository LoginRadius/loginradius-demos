import { BaseRepository } from "@/db/repositories/base.js";
import type {
  User,
  CreateUserInput,
} from "@/types/user.types.js";
import type { UserRow } from "@/db/types.js";

class UserRepository extends BaseRepository {
  /**
   * Convert database row to User object
   */
  private rowToUser(row: UserRow): User {
    return {
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name,
      department: row.department || undefined,
      managerId: row.manager_id || undefined,
      lrUserId: row.lr_user_id || undefined,
      createdAt: this.toDate(row.created_at),
      updatedAt: this.toDate(row.updated_at),
    };
  }

  /**
   * Find user by ID
   */
  findById(userId: string): User | null {
    const row = this.db
      .prepare(
        `
      SELECT * FROM users WHERE user_id = ?
    `,
      )
      .get(userId) as UserRow | undefined;

    return row ? this.rowToUser(row) : null;
  }

  /**
   * Find user by email
   */
  findByEmail(email: string): User | null {
    const row = this.db
      .prepare(
        `
      SELECT * FROM users WHERE email = ?
    `,
      )
      .get(email) as UserRow | undefined;

    return row ? this.rowToUser(row) : null;
  }

  /**
   * Find user by LoginRadius user ID
   */
  findByLrUserId(lrUserId: string): User | null {
    const row = this.db
      .prepare(
        `
      SELECT * FROM users WHERE lr_user_id = ?
    `,
      )
      .get(lrUserId) as UserRow | undefined;

    return row ? this.rowToUser(row) : null;
  }

  /**
   * Find user by LoginRadius user ID or email
   */
  findByLrUserIdOrEmail(lrUserId?: string, email?: string): User | null {
    if (lrUserId) {
      const user = this.findByLrUserId(lrUserId);
      if (user) return user;
    }

    if (email) {
      return this.findByEmail(email);
    }

    return null;
  }

  /**
   * Get all users
   */
  findAll(): User[] {
    const rows = this.db
      .prepare(
        `
      SELECT * FROM users ORDER BY full_name
    `,
      )
      .all() as UserRow[];

    return rows.map((row) => this.rowToUser(row));
  }

  /**
   * Check if a user is a team member of a manager
   */
  isTeamMember(userId: string, managerId: string): boolean {
    const result = this.db
      .prepare(
        `
      SELECT 1 FROM users WHERE user_id = ? AND manager_id = ?
    `,
      )
      .get(userId, managerId);

    return !!result;
  }

  /**
   * Create a new user
   */
  create(input: CreateUserInput): User {
    const now = new Date().toISOString();

    this.db
      .prepare(
        `
      INSERT INTO users (user_id, email, full_name, department, manager_id, lr_user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        input.userId,
        input.email,
        input.fullName,
        input.department || null,
        input.managerId || null,
        input.lrUserId || null,
        now,
        now,
      );

    return this.findById(input.userId)!;
  }

  /**
   * Links a local row to its LoginRadius account. Used when a user who was
   * seeded or created in the dashboard signs in for the first time and is
   * matched by email.
   */
  linkLrUserId(userId: string, lrUserId: string): User | null {
    this.db
      .prepare(
        `
      UPDATE users SET lr_user_id = ?, updated_at = ? WHERE user_id = ?
    `,
      )
      .run(lrUserId, new Date().toISOString(), userId);

    return this.findById(userId);
  }

  /**
   * Updates the fields this app owns. Roles deliberately are not among them —
   * they live in LoginRadius and reach the app through token scopes.
   */
  updateProfile(
    userId: string,
    input: { department?: string | null; managerId?: string | null },
  ): User | null {
    const fields: string[] = [];
    const values: Array<string | null> = [];

    if (input.department !== undefined) {
      fields.push("department = ?");
      values.push(input.department);
    }

    if (input.managerId !== undefined) {
      fields.push("manager_id = ?");
      values.push(input.managerId);
    }

    if (fields.length === 0) {
      return this.findById(userId);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    this.db
      .prepare(`UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`)
      .run(...values, userId);

    return this.findById(userId);
  }

  /**
   * Delete a user
   */
  delete(userId: string): boolean {
    const result = this.db
      .prepare(
        `
      DELETE FROM users WHERE user_id = ?
    `,
      )
      .run(userId);

    return result.changes > 0;
  }

}

// Export singleton instance
export const userRepository = new UserRepository();

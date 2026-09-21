import { userRepository } from "@/db/repositories/index.js";
import type { RegisterUserInput } from "@/api/validators/user.validator.js";
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors.js";
import { generateUUID } from "@/utils/uuid.js";
import type { TokenData } from "@/utils/oidc.js";
import type { User } from "@/types/user.types.js";

/** Best display name available from the token's claims. */
function displayNameFrom(
  claims: Record<string, unknown>,
  email: string,
): string {
  const name = claims.name as string | undefined;
  if (name) return name;

  const given = claims.given_name as string | undefined;
  const family = claims.family_name as string | undefined;
  const joined = [given, family].filter(Boolean).join(" ");

  return joined || (email.split("@")[0] as string);
}

class UserService {
  /**
   * Resolves the local row for a verified token, creating it on first sight.
   *
   * There is no sign-up flow — accounts live in LoginRadius. The local row only
   * carries what this app owns (department, manager), so provisioning it on the
   * fly grants nothing: authorization still comes from the token's scopes.
   *
   * Only ever call this with an already-verified token.
   */
  resolveFromToken(tokenData: TokenData): User | null {
    const existing = userRepository.findByLrUserId(tokenData.sub);
    if (existing) return existing;

    const email = tokenData.claims.email as string | undefined;

    // Token-exchange and service tokens may carry no email claim. Without one
    // there is nothing to match or create against, so an unknown subject stays
    // unknown rather than becoming a row with a synthesised address.
    if (!email) return null;

    // A user seeded locally or created in the LoginRadius dashboard already has
    // a row keyed by email; link it rather than inserting a duplicate, which the
    // UNIQUE constraint on email would reject anyway.
    const byEmail = userRepository.findByEmail(email);
    if (byEmail) {
      return byEmail.lrUserId === tokenData.sub
        ? byEmail
        : userRepository.linkLrUserId(byEmail.userId, tokenData.sub);
    }

    return userRepository.create({
      userId: generateUUID(),
      email,
      fullName: displayNameFrom(tokenData.claims, email),
      lrUserId: tokenData.sub,
    });
  }

  /** Everyone who has signed in, plus anyone seeded. Local data only. */
  listUsers(): User[] {
    return userRepository.findAll();
  }

  /**
   * The manager link is org structure owned by this app, not a permission.
   * Naming someone a manager grants nothing on its own — they still need
   * `expense:view:team` / `expense:approve` in their LoginRadius token before
   * they can read or act on their reports' expenses. Any user is therefore a
   * valid choice, so the Users list itself is the candidate set.
   */
  updateProfile(
    userId: string,
    input: { department?: string | null; managerId?: string | null },
  ): User {
    const user = userRepository.findById(userId);
    if (!user) throw new NotFoundError("User", userId);

    if (input.managerId) {
      if (input.managerId === userId) {
        throw new ValidationError("A user cannot be their own manager");
      }

      const manager = userRepository.findById(input.managerId);
      if (!manager) throw new NotFoundError("Manager", input.managerId);
    }

    return userRepository.updateProfile(userId, input) as User;
  }

  registerUser(input: RegisterUserInput) {
    const existing = userRepository.findByLrUserId(input.lrUserId);
    if (existing) {
      throw new ConflictError("User already registered", {
        lr_user_id: input.lrUserId,
      });
    }

    if (input.managerId) {
      const manager = userRepository.findById(input.managerId);
      if (!manager) {
        throw new NotFoundError("Manager", input.managerId);
      }
    }

    return userRepository.create({
      userId: generateUUID(),
      email: input.email,
      fullName: input.fullName,
      department: input.department,
      managerId: input.managerId,
      lrUserId: input.lrUserId,
    });
  }
}

export const userService = new UserService();

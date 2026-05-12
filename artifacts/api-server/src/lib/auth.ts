import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const GUEST_CLERK_ID = "guest_user";

export async function getGuestUser() {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, GUEST_CLERK_ID)).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(usersTable).values({
    clerkId: GUEST_CLERK_ID,
    email: "guest@englishaicoach.app",
    displayName: "Học Viên",
    avatarUrl: null,
  }).returning();
  return created;
}

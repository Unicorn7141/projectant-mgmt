import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "1123698";

export type AuthUser = {
  id: number;
  roles: string[];
  departmentId: number | null;
};

export async function requireAuth(
  authHeader: string | null,
): Promise<AuthUser> {
  if (!authHeader?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = authHeader.substring(7);

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { roles: { include: { role: true } } },
  });

  if (!user || !user.isActive) throw new Error("UNAUTHORIZED");

  return {
    id: user.id,
    roles: user.roles.map((ur) => ur.role.name),
    departmentId: user.departmentId,
  };
}

export function hasRole(user: AuthUser, ...roles: string[]) {
  return roles.some((r) => user.roles.includes(r));
}

// מחזיר את כל ה-IDs של משתמשים שנוצרו "מתחת" ל-user הנוכחי (רקורסיבי)
export async function getVisibleUserIds(userId: number): Promise<number[]> {
  const ids: number[] = [userId];
  const queue = [userId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = await prisma.user.findMany({
      where: { createdById: current },
      select: { id: true },
    });
    for (const child of children) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }

  return ids;
}

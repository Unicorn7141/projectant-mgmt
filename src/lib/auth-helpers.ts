import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { assertJwtSecret } from "@/lib/auth-config";

const JWT_SECRET = assertJwtSecret();

type RoleEntry = { role: { name: string } };
type IdEntry = { id: number };

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
    roles: user.roles.map((ur: RoleEntry) => ur.role.name),
    departmentId: user.departmentId,
  };
}

export function hasRole(user: AuthUser, ...roles: string[]) {
  return roles.some((r) => user.roles.includes(r));
}

export function isStudentOnly(roleNames: string[]) {
  return roleNames.length > 0 && roleNames.every((role) => role === "STUDENT");
}

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
      if (!ids.includes(child.id)) {
        ids.push(child.id);
        queue.push(child.id);
      }
    }
  }

  return ids;
}

export async function getManageableUserIds(user: AuthUser): Promise<number[]> {
  if (hasRole(user, "ADMIN")) {
    const users = await prisma.user.findMany({ select: { id: true } });
    return users.map((entry: IdEntry) => entry.id);
  }

  return getVisibleUserIds(user.id);
}

export async function getListableUserIds(user: AuthUser): Promise<number[]> {
  const ids = await getManageableUserIds(user);
  return ids.filter((id) => id !== user.id);
}

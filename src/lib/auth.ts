import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { assertJwtSecret, DEFAULT_PASSWORD } from "@/lib/auth-config";

const JWT_SECRET = assertJwtSecret();

type RoleRecord = { id: number };

export type PublicUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mustChangePassword: boolean;
  roles: string[];
  profileImage?: string | null;
};

export async function createUserWithDefaultPassword(params: {
  firstName: string;
  lastName: string;
  email: string;
  roleNames: string[];
}) {
  const { firstName, lastName, email, roleNames } = params;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User with this email already exists");

  const baseUsername = `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/\s+/g, "");
  let username = baseUsername;
  let counter = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const roles = await prisma.role.findMany({
    where: { name: { in: roleNames } },
  });
  if (roles.length !== roleNames.length) {
    throw new Error("One or more roles not found");
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      username,
      passwordHash,
      mustChangePassword: true,
      isActive: true,
      roles: {
        create: roles.map((r: RoleRecord) => ({
          role: { connect: { id: r.id } },
        })),
      },
    },
    include: {
      roles: { include: { role: true } },
    },
  });

  return {
    user: toPublicUser(user),
    defaultPassword: DEFAULT_PASSWORD,
  };
}

export async function loginUser(params: {
  usernameOrEmail: string;
  password: string;
}) {
  const { usernameOrEmail, password } = params;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    },
    include: {
      roles: { include: { role: true } },
    },
  });

  if (!user || !user.isActive) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "8h",
  });

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function changePassword(params: {
  userId: number;
  oldPassword: string;
  newPassword: string;
}) {
  const { userId, oldPassword, newPassword } = params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) throw new Error("Old password is incorrect");

  if (newPassword === DEFAULT_PASSWORD) {
    throw new Error("New password cannot be the default password");
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });
}

function toPublicUser(user: any): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    mustChangePassword: user.mustChangePassword,
    roles: user.roles?.map((ur: any) => ur.role.name) ?? [],
    profileImage: user.profileImage ?? null,
  };
}

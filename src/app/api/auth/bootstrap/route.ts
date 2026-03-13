import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PASSWORD } from "@/lib/auth-config";

export async function POST(req: NextRequest) {
  try {
    const usersCount = await prisma.user.count();
    if (usersCount > 0) {
      return NextResponse.json(
        { message: "המערכת כבר אותחלה" },
        { status: 409 },
      );
    }

    const body = await req.json();
    const { firstName, lastName, email, username } = body || {};
    if (!firstName || !lastName || !email || !username) {
      return NextResponse.json({ message: "שדות חסרים" }, { status: 400 });
    }

    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) {
      return NextResponse.json(
        { message: "תפקיד ADMIN לא קיים. הרץ seed לפני האתחול" },
        { status: 400 },
      );
    }

    const normalizedUsername = String(username)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: normalizedUsername }],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "המשתמש כבר קיים" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username: normalizedUsername,
        passwordHash,
        mustChangePassword: true,
        isActive: true,
        roles: {
          create: [{ role: { connect: { id: adminRole.id } } }],
        },
      },
      include: { roles: { include: { role: true } } },
    });

    return NextResponse.json(
      {
        message: "משתמש האתחול נוצר בהצלחה",
        user: {
          id: user.id,
          username: user.username,
          roles: user.roles.map((entry) => entry.role.name),
        },
        defaultPassword: DEFAULT_PASSWORD,
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה באתחול המערכת" },
      { status: 500 },
    );
  }
}

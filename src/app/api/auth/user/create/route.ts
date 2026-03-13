import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  hasRole,
  isStudentOnly,
} from "@/lib/auth-helpers";
import { DEFAULT_PASSWORD } from "@/lib/auth-config";

export async function POST(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));

    const body = await req.json();
    const { firstName, lastName, email, roleNames } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !Array.isArray(roleNames) ||
      roleNames.length === 0
    ) {
      return NextResponse.json({ message: "שדות חסרים" }, { status: 400 });
    }

    if (hasRole(caller, "MENTOR")) {
      if (!isStudentOnly(roleNames)) {
        return NextResponse.json(
          { message: "מנטור יכול ליצור סטודנטים בלבד" },
          { status: 403 },
        );
      }
    } else if (!hasRole(caller, "ADMIN")) {
      return NextResponse.json({ message: "אין הרשאה" }, { status: 403 });
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "משתמש עם אימייל זה כבר קיים" },
        { status: 409 },
      );
    }

    let username: string;
    if (body.username && body.username.trim()) {
      username = body.username.trim().toLowerCase().replace(/\s+/g, "");
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) {
        return NextResponse.json(
          { message: "שם משתמש זה כבר תפוס" },
          { status: 409 },
        );
      }
    } else {
      const base = `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, "");
      username = base;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${base}${counter++}`;
      }
    }

    let departmentId: number | null = null;
    if (hasRole(caller, "MENTOR")) {
      departmentId = caller.departmentId;
    } else if (body.departmentId !== undefined && body.departmentId !== null) {
      departmentId = Number(body.departmentId);
    }

    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        return NextResponse.json({ message: "מחלקה לא קיימת" }, { status: 400 });
      }
    }

    const roles = await prisma.role.findMany({
      where: { name: { in: roleNames } },
    });
    if (roles.length !== roleNames.length) {
      return NextResponse.json({ message: "תפקיד לא קיים" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        passwordHash,
        mustChangePassword: true,
        isActive: true,
        college: body.college ?? null,
        profileImage: body.profileImage ?? null,
        createdBy: { connect: { id: caller.id } },
        ...(departmentId && {
          department: { connect: { id: departmentId } },
        }),
        roles: {
          create: roles.map((r: { id: number }) => ({
            role: { connect: { id: r.id } },
          })),
        },
      },
      include: {
        roles: { include: { role: true } },
        department: { include: { unit: { include: { company: true } } } },
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          roles: user.roles.map((ur: any) => ur.role.name),
          departmentId: user.departmentId,
        },
        defaultPassword: DEFAULT_PASSWORD,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "שגיאה ביצירת משתמש" },
      { status: 500 },
    );
  }
}

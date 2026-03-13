import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getVisibleUserIds } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));

    const visibleIds = await getVisibleUserIds(caller.id);

    const users = await prisma.user.findMany({
      where: {
        id: { in: visibleIds, not: caller.id },
      },
      include: {
        roles: { include: { role: true } },
        department: { include: { unit: { include: { company: true } } } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        username: u.username,
        isActive: u.isActive,
        roles: u.roles.map((ur) => ur.role.name),
        department: u.department?.name ?? null,
        unit: u.department?.unit?.name ?? null,
        company: u.department?.unit?.company?.name ?? null,
        createdBy: u.createdBy
          ? `${u.createdBy.firstName} ${u.createdBy.lastName}`
          : null,
        college: u.college ?? null,
        profileImage: u.profileImage ?? null,
      })),
    );
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "לא מורשה" }, { status: 401 });
    }
    return NextResponse.json({ message: "שגיאה" }, { status: 500 });
  }
}

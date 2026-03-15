import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getVisibleUserIds } from "@/lib/auth-helpers";

type UserWithRelations = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isActive: boolean;
  college: string | null;
  profileImage: string | null;
  roles: { role: { name: string } }[];
  department: {
    id: number;
    name: string;
    unit: { id: number; name: string; company: { id: number; name: string } };
  } | null;
  createdBy: { firstName: string; lastName: string } | null;
};

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
      orderBy: [
        { department: { unit: { company: { name: "asc" } } } },
        { department: { unit: { name: "asc" } } },
        { department: { name: "asc" } },
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    });

    return NextResponse.json(
      (users as UserWithRelations[]).map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        username: u.username,
        isActive: u.isActive,
        roles: u.roles.map((ur: { role: { name: string } }) => ur.role.name),
        departmentId: u.department?.id ?? null,
        department: u.department?.name ?? null,
        unit: u.department?.unit?.name ?? null,
        company: u.department?.unit?.company?.name ?? null,
        path: u.department
          ? `${u.department.unit.company.name} / ${u.department.unit.name} / ${u.department.name}`
          : null,
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

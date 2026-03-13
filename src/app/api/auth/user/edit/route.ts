import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getVisibleUserIds } from "@/lib/auth-helpers";

export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    const body = await req.json();
    const { id, firstName, lastName, email, isActive, departmentId, roles } =
      body;

    if (!id) return NextResponse.json({ message: "חסר ID" }, { status: 400 });

    const visibleIds = await getVisibleUserIds(caller.id);
    if (!visibleIds.includes(Number(id))) {
      return NextResponse.json(
        { message: "אין הרשאה לערוך משתמש זה" },
        { status: 403 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...(body.college !== undefined && { college: body.college }),
        ...(body.profileImage !== undefined && {
          profileImage: body.profileImage,
        }),
        ...(departmentId !== undefined && {
          department: departmentId
            ? { connect: { id: Number(departmentId) } }
            : { disconnect: true },
        }),
      },
      include: {
        roles: { include: { role: true } },
        department: true,
      },
    });

    // עדכון תפקידים
    if (Array.isArray(roles) && roles.length > 0) {
      await prisma.userRole.deleteMany({ where: { userId: Number(id) } });

      const roleRecords = await prisma.role.findMany({
        where: { name: { in: roles } },
      });

      await prisma.userRole.createMany({
        data: roleRecords.map((r) => ({ userId: Number(id), roleId: r.id })),
      });
    }

    return NextResponse.json({
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      username: updated.username,
      isActive: updated.isActive,
      roles: updated.roles.map((ur) => ur.role.name),
      department: updated.department?.name ?? null,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "לא מורשה" }, { status: 401 });
    }
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

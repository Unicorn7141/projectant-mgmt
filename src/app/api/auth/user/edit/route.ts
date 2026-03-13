import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  getManageableUserIds,
  hasRole,
  isStudentOnly,
} from "@/lib/auth-helpers";

type RoleEntry = { role: { name: string } };
type RoleRecord = { id: number };

export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    const body = await req.json();
    const { id, firstName, lastName, email, isActive, departmentId, roles } =
      body;

    if (!id) return NextResponse.json({ message: "חסר ID" }, { status: 400 });
    const targetId = Number(id);

    if (caller.id === targetId) {
      return NextResponse.json(
        { message: "לא ניתן לערוך את המשתמש המחובר דרך מסך זה" },
        { status: 400 },
      );
    }

    const manageableIds = await getManageableUserIds(caller);
    if (!manageableIds.includes(targetId)) {
      return NextResponse.json(
        { message: "אין הרשאה לערוך משתמש זה" },
        { status: 403 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      include: { roles: { include: { role: true } } },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "משתמש לא נמצא" }, { status: 404 });
    }

    const requestedRoles: string[] | undefined = Array.isArray(roles)
      ? roles
      : undefined;
    const targetRoles = targetUser.roles.map((ur: RoleEntry) => ur.role.name);

    if (hasRole(caller, "MENTOR")) {
      if (!isStudentOnly(targetRoles)) {
        return NextResponse.json(
          { message: "מנטור יכול לערוך סטודנטים בלבד" },
          { status: 403 },
        );
      }
      if (requestedRoles && !isStudentOnly(requestedRoles)) {
        return NextResponse.json(
          { message: "מנטור לא יכול לשנות תפקידים שאינם סטודנט" },
          { status: 403 },
        );
      }
    } else if (!hasRole(caller, "ADMIN")) {
      return NextResponse.json({ message: "אין הרשאה" }, { status: 403 });
    }

    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: Number(departmentId) },
      });
      if (!department) {
        return NextResponse.json({ message: "מחלקה לא קיימת" }, { status: 400 });
      }
    }

    if (requestedRoles && requestedRoles.length > 0) {
      const roleRecords = await prisma.role.findMany({
        where: { name: { in: requestedRoles } },
      });
      if (roleRecords.length !== requestedRoles.length) {
        return NextResponse.json({ message: "תפקיד לא קיים" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: targetId },
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
        });

        await tx.userRole.deleteMany({ where: { userId: targetId } });
        await tx.userRole.createMany({
          data: roleRecords.map((r: RoleRecord) => ({
            userId: targetId,
            roleId: r.id,
          })),
        });
      });
    } else {
      await prisma.user.update({
        where: { id: targetId },
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
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: targetId },
      include: {
        roles: { include: { role: true } },
        department: { include: { unit: { include: { company: true } } } },
      },
    });

    return NextResponse.json({
      id: updated!.id,
      firstName: updated!.firstName,
      lastName: updated!.lastName,
      email: updated!.email,
      username: updated!.username,
      isActive: updated!.isActive,
      departmentId: updated!.departmentId,
      roles: updated!.roles.map((ur: RoleEntry) => ur.role.name),
      department: updated!.department?.name ?? null,
      unit: updated!.department?.unit?.name ?? null,
      company: updated!.department?.unit?.company?.name ?? null,
      college: updated!.college ?? null,
      profileImage: updated!.profileImage ?? null,
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

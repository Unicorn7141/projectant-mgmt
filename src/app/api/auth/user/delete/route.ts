import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  getManageableUserIds,
  hasRole,
  isStudentOnly,
} from "@/lib/auth-helpers";

export async function DELETE(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    const { id } = await req.json();

    if (!id) return NextResponse.json({ message: "חסר ID" }, { status: 400 });
    const targetId = Number(id);

    if (caller.id === targetId) {
      return NextResponse.json(
        { message: "לא ניתן להשבית את המשתמש המחובר" },
        { status: 400 },
      );
    }

    const manageableIds = await getManageableUserIds(caller);
    if (!manageableIds.includes(targetId)) {
      return NextResponse.json(
        { message: "אין הרשאה להשבית משתמש זה" },
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

    const targetRoles = targetUser.roles.map((ur) => ur.role.name);
    if (hasRole(caller, "MENTOR") && !isStudentOnly(targetRoles)) {
      return NextResponse.json(
        { message: "מנטור יכול להשבית סטודנטים בלבד" },
        { status: 403 },
      );
    }
    if (!hasRole(caller, "ADMIN", "MENTOR")) {
      return NextResponse.json({ message: "אין הרשאה" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "המשתמש הושבת בהצלחה" });
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

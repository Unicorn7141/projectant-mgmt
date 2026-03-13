import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getVisibleUserIds } from "@/lib/auth-helpers";

export async function DELETE(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    const { id } = await req.json();

    if (!id) return NextResponse.json({ message: "חסר ID" }, { status: 400 });

    const visibleIds = await getVisibleUserIds(caller.id);
    if (!visibleIds.includes(Number(id))) {
      return NextResponse.json(
        { message: "אין הרשאה למחוק משתמש זה" },
        { status: 403 },
      );
    }

    // מחיקת roles קודם (foreign key)
    await prisma.userRole.deleteMany({ where: { userId: Number(id) } });
    // מחיקת המשתמש עצמו
    await prisma.user.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "המשתמש נמחק בהצלחה" });
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

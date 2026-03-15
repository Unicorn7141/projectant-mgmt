import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth-helpers";
import { deleteUsersAndDependencies } from "@/lib/org-cascade";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req.headers.get("authorization"));
    const departments = await prisma.department.findMany({
      include: { unit: { include: { company: true } } },
      orderBy: [
        { unit: { company: { name: "asc" } } },
        { unit: { name: "asc" } },
        { name: "asc" },
      ],
    });
    return NextResponse.json(departments);
  } catch {
    return NextResponse.json({ message: "לא מורשה" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    if (!hasRole(caller, "ADMIN")) {
      return NextResponse.json({ message: "אדמין בלבד" }, { status: 403 });
    }
    const { name, unitId } = await req.json();
    if (!name || !unitId) {
      return NextResponse.json({ message: "שדות חסרים" }, { status: 400 });
    }
    const department = await prisma.department.create({
      data: { name, unitId: Number(unitId) },
      include: { unit: { include: { company: true } } },
    });
    return NextResponse.json(department, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    if (!hasRole(caller, "ADMIN")) {
      return NextResponse.json({ message: "אדמין בלבד" }, { status: 403 });
    }
    const { id, name, unitId } = await req.json();
    if (!id) return NextResponse.json({ message: "חסר ID" }, { status: 400 });
    const department = await prisma.department.update({
      where: { id: Number(id) },
      data: {
        ...(name ? { name } : {}),
        ...(unitId ? { unitId: Number(unitId) } : {}),
      },
      include: { unit: { include: { company: true } } },
    });
    return NextResponse.json(department);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    if (!hasRole(caller, "ADMIN")) {
      return NextResponse.json({ message: "אדמין בלבד" }, { status: 403 });
    }
    const { id } = await req.json();
    const departmentId = Number(id);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const users = await tx.user.findMany({
        where: { departmentId },
        select: { id: true },
      });

      await deleteUsersAndDependencies(
        tx,
        users.map((user) => user.id),
      );

      await tx.department.delete({ where: { id: departmentId } });
    });

    return NextResponse.json({ message: "המחלקה וכל המשתמשים שלה נמחקו" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

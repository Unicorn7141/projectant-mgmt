import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth-helpers";
import { deleteUsersAndDependencies } from "@/lib/org-cascade";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req.headers.get("authorization"));
    const units = await prisma.unit.findMany({
      include: { company: true, departments: true },
      orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
    });
    return NextResponse.json(units);
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
    const { name, companyId } = await req.json();
    if (!name || !companyId) {
      return NextResponse.json({ message: "שדות חסרים" }, { status: 400 });
    }
    const unit = await prisma.unit.create({
      data: { name, companyId: Number(companyId) },
      include: { company: true },
    });
    return NextResponse.json(unit, { status: 201 });
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
    const { id, name, companyId } = await req.json();
    const unit = await prisma.unit.update({
      where: { id: Number(id) },
      data: {
        ...(name ? { name } : {}),
        ...(companyId ? { companyId: Number(companyId) } : {}),
      },
      include: { company: true },
    });
    return NextResponse.json(unit);
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
    const unitId = Number(id);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const departments = await tx.department.findMany({
        where: { unitId },
        select: { id: true },
      });
      const departmentIds = departments.map((department) => department.id);

      const users = await tx.user.findMany({
        where: { departmentId: { in: departmentIds } },
        select: { id: true },
      });
      await deleteUsersAndDependencies(
        tx,
        users.map((user) => user.id),
      );

      if (departmentIds.length > 0) {
        await tx.department.deleteMany({
          where: { id: { in: departmentIds } },
        });
      }

      await tx.unit.delete({ where: { id: unitId } });
    });

    return NextResponse.json({ message: "היחידה וכל מה ששייך אליה נמחקו" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

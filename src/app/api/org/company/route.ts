import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth-helpers";
import { deleteUsersAndDependencies } from "@/lib/org-cascade";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req.headers.get("authorization"));
    const companies = await prisma.company.findMany({
      include: { units: { include: { departments: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(companies);
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
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ message: "שם חסר" }, { status: 400 });
    }
    const company = await prisma.company.create({ data: { name } });
    return NextResponse.json(company, { status: 201 });
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
    const { id, name } = await req.json();
    if (!id) return NextResponse.json({ message: "חסר ID" }, { status: 400 });
    const company = await prisma.company.update({
      where: { id: Number(id) },
      data: { name },
    });
    return NextResponse.json(company);
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
    const companyId = Number(id);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const units = await tx.unit.findMany({
        where: { companyId },
        select: { id: true },
      });
      const unitIds = units.map((unit) => unit.id);

      const departments = await tx.department.findMany({
        where: { unitId: { in: unitIds } },
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

      if (unitIds.length > 0) {
        await tx.unit.deleteMany({
          where: { id: { in: unitIds } },
        });
      }

      await tx.company.delete({ where: { id: companyId } });
    });

    return NextResponse.json({ message: "החברה וכל מה ששייך אליה נמחקו" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

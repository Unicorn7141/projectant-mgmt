import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth-helpers";

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
    await prisma.company.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "נמחק בהצלחה" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

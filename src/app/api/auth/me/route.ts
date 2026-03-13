import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      mustChangePassword: user.mustChangePassword,
      roles: user.roles.map((ur: { role: { name: string } }) => ur.role.name),
    });
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

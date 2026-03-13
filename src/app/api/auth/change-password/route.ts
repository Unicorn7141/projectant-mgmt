import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { changePassword } from "@/lib/auth";
import { assertJwtSecret } from "@/lib/auth-config";

const JWT_SECRET = assertJwtSecret();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring("Bearer ".length);

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body || {};

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "oldPassword and newPassword are required" },
        { status: 400 },
      );
    }

    await changePassword({
      userId: payload.userId,
      oldPassword,
      newPassword,
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Could not change password" },
      { status: 400 },
    );
  }
}

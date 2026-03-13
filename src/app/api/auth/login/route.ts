import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usernameOrEmail, password } = body || {};

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { message: "usernameOrEmail and password are required" },
        { status: 400 },
      );
    }

    const result = await loginUser({ usernameOrEmail, password });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Login failed" },
      { status: 401 },
    );
  }
}

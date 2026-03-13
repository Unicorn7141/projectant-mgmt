import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { requireAuth } from "@/lib/auth-helpers";

const utapi = new UTApi();
const MAX_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req.headers.get("authorization"));

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "לא נשלח קובץ" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "סוג הקובץ אינו נתמך" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: "הקובץ גדול מדי" },
        { status: 400 },
      );
    }

    const response = await utapi.uploadFiles(file);
    if (response.error) {
      throw new Error(response.error.message);
    }

    return NextResponse.json({
      url: response.data.ufsUrl ?? response.data.url,
    });
  } catch (err: any) {
    const status = err.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status },
    );
  }
}

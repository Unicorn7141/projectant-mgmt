import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "לא נשלח קובץ" }, { status: 400 });
    }
    const response = await utapi.uploadFiles(file);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return NextResponse.json({ url: response.data.url });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "שגיאה" },
      { status: 500 },
    );
  }
}

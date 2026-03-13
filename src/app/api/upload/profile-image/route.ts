import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

const utapi = new UTApi();
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));
    const formData = await req.formData();
    const file = formData.get("file");
    const saveToProfile = formData.get("saveToProfile") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "לא נשלח קובץ" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "יש להעלות קובץ תמונה בלבד" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "גודל הקובץ חורג מ-4MB" },
        { status: 400 },
      );
    }

    const response = await utapi.uploadFiles(file);
    if (response.error || !response.data) {
      throw new Error(response.error?.message || "Upload failed");
    }

    const url = response.data.ufsUrl ?? response.data.url;
    if (!url) {
      throw new Error("Upload URL missing");
    }

    if (saveToProfile) {
      const user = await prisma.user.update({
        where: { id: caller.id },
        data: { profileImage: url },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          mustChangePassword: true,
          profileImage: true,
          roles: { include: { role: true } },
        },
      });

      return NextResponse.json({
        url,
        user: {
          ...user,
          roles: user.roles.map((entry: { role: { name: string } }) => entry.role.name),
        },
      });
    }

    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "שגיאה";
    const status = message === "UNAUTHORIZED" ? 401 : 500;

    return NextResponse.json({ message }, { status });
  }
}

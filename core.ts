import { createUploadthing, type FileRouter } from "uploadthing/next";
import { requireAuth } from "@/lib/auth-helpers";

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await requireAuth(req.headers.get("authorization"));
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

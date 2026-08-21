import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [nameSetting, logoSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "hospitalName" } }),
    prisma.setting.findUnique({ where: { key: "hospitalLogo" } }),
  ]);
  return Response.json({
    hospitalName: nameSetting?.value || "Yetena Medhin",
    hospitalLogo: logoSetting?.value || null,
  });
}
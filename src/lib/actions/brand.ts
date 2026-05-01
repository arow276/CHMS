"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ensureChurch } from "@/lib/assistant/runner";

const HEX = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a #RRGGBB color.");

const BrandInput = z.object({
  name: z.string().min(1),
  tagline: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: HEX,
  accentColor: HEX,
  bgColor: HEX,
  textColor: HEX,
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
  serviceTimes: z.string().optional().nullable(),
  publishSite: z.boolean().default(true),
});

export async function updateBrand(formData: FormData) {
  const church = await ensureChurch();
  const obj = Object.fromEntries(formData.entries()) as Record<string, string>;
  const data = BrandInput.parse({
    name: obj.name,
    tagline: obj.tagline || null,
    mission: obj.mission || null,
    about: obj.about || null,
    logoUrl: obj.logoUrl || null,
    primaryColor: obj.primaryColor || "#0EA5E9",
    accentColor: obj.accentColor || "#F59E0B",
    bgColor: obj.bgColor || "#FFFFFF",
    textColor: obj.textColor || "#0F172A",
    address: obj.address || null,
    city: obj.city || null,
    state: obj.state || null,
    zip: obj.zip || null,
    phone: obj.phone || null,
    email: obj.email || null,
    websiteUrl: obj.websiteUrl || null,
    facebookUrl: obj.facebookUrl || null,
    instagramUrl: obj.instagramUrl || null,
    youtubeUrl: obj.youtubeUrl || null,
    serviceTimes: obj.serviceTimes || null,
    publishSite: obj.publishSite === "on",
  });
  await db.church.update({
    where: { id: church.id },
    data: { ...data, slug: slugify(data.name) },
  });
  revalidatePath("/brand");
  revalidatePath("/website");
  revalidatePath("/home");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

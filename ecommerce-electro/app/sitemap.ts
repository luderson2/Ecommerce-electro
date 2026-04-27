import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  const supabase = getPublicSupabaseClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/catalogue`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/packs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/comparateur`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/reparation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/livraison-retours`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/garantie`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  if (!supabase) return staticRoutes;

  const [{ data: products }, { data: packs }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("packs").select("slug, created_at").eq("is_active", true),
    supabase.from("categories").select("slug, created_at"),
  ]);

  return [
    ...staticRoutes,
    ...(products ?? []).map((product) => ({
      url: `${baseUrl}/catalogue/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(packs ?? []).map((pack) => ({
      url: `${baseUrl}/packs/${pack.slug}`,
      lastModified: pack.created_at ? new Date(pack.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(categories ?? []).map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.created_at ? new Date(category.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

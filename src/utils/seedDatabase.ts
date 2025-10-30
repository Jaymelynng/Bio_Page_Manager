import { supabase } from "@/integrations/supabase/client";
import { brands, linkCategories, createBrandLinks } from "@/data/gymsData";

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // 1. Seed link categories
    console.log("📁 Seeding link categories...");
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("link_categories")
      .upsert(
        linkCategories.map(cat => ({
          name: cat.name as any,
          icon: cat.icon,
          display_order: cat.display_order,
          is_active: cat.is_active
        })),
        { onConflict: 'name' }
      )
      .select();

    if (categoriesError) throw categoriesError;
    console.log(`✅ Seeded ${categoriesData?.length} categories`);

    // 2. Seed brands
    console.log("🏢 Seeding brands...");
    const { data: brandsData, error: brandsError } = await supabase
      .from("brands")
      .upsert(
        brands.map(brand => ({
          name: brand.name,
          handle: brand.handle,
          description: brand.description,
          color: brand.color_primary || brand.color || "#667eea",
          logo_url: brand.logo_url,
          is_active: brand.is_active
        })),
        { onConflict: 'handle' }
      )
      .select();

    if (brandsError) throw brandsError;
    console.log(`✅ Seeded ${brandsData?.length} brands`);

    // 3. Get category IDs map
    const categoryMap = new Map(
      categoriesData?.map(cat => [cat.name, cat.id])
    );

    // 4. Seed brand links for each brand
    console.log("🔗 Seeding brand links...");
    for (const brand of brandsData || []) {
      const links = createBrandLinks(brand.handle);
      
      const linksToInsert = links.map(link => ({
        brand_id: brand.id,
        category_id: categoryMap.get(link.category as any),
        title: link.title,
        url: link.url,
        icon: link.icon,
        display_order: link.display_order,
        is_featured: link.is_featured,
        is_active: link.is_active
      }));

      const { error: linksError } = await supabase
        .from("brand_links")
        .insert(linksToInsert);

      if (linksError) {
        console.error(`Error seeding links for ${brand.name}:`, linksError);
        continue;
      }
      
      console.log(`  ✅ Seeded ${links.length} links for ${brand.name}`);
    }

    console.log("🎉 Database seeding completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    return { success: false, error };
  }
};

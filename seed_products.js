import { db } from './src/config/db.js';

const seedProducts = async () => {
  console.log('🌱 Seeding Products Database...\n');

  try {
    // Get or create SWAGS category
    let swagsCategory = await db('sl_shop_categories')
      .where('category_name', 'SWAGS')
      .first();
    if (!swagsCategory) {
      const [catId] = await db('sl_shop_categories').insert({
        category_name: 'SWAGS',
        is_active: 1
      });
      swagsCategory = { category_id: catId };
      console.log('✅ Created SWAGS category');
    }
    console.log(`✅ Using SWAGS category (ID: ${swagsCategory.category_id})`);

    // Get or create variation types
    let sizeType = await db('sl_variation_types').where('type_name', 'size').first();
    if (!sizeType) {
      const [id] = await db('sl_variation_types').insert({
        type_name: 'size',
        type_label: 'Size',
        is_active: 1,
        sort_order: 1
      });
      sizeType = { variation_type_id: id };
      console.log('✅ Created size variation type');
    }
    let colorType = await db('sl_variation_types').where('type_name', 'color').first();
    if (!colorType) {
      const [id] = await db('sl_variation_types').insert({
        type_name: 'color',
        type_label: 'Color',
        is_active: 1,
        sort_order: 2
      });
      colorType = { variation_type_id: id };
      console.log('✅ Created color variation type');
    }
    let designType = await db('sl_variation_types').where('type_name', 'design').first();
    if (!designType) {
      const [id] = await db('sl_variation_types').insert({
        type_name: 'design',
        type_label: 'Design',
        is_active: 1,
        sort_order: 3
      });
      designType = { variation_type_id: id };
      console.log('✅ Created design variation type');
    }

    // Get or create variation options
    const ensureOption = async (typeId, value, label, hex = null, sort = 1) => {
      let opt = await db('sl_variation_options')
        .where('variation_type_id', typeId)
        .where('option_value', value)
        .first();
      if (!opt) {
        const [id] = await db('sl_variation_options').insert({
          variation_type_id: typeId,
          option_value: value,
          option_label: label,
          hex_color: hex,
          is_active: 1,
          sort_order: sort
        });
        opt = { option_id: id, option_value: value, option_label: label };
        console.log(`✅ Created option: ${label}`);
      }
      return opt;
    };

    // Sizes
    const sizeOptions = [
      await ensureOption(sizeType.variation_type_id, 's', 'Small', null, 1),
      await ensureOption(sizeType.variation_type_id, 'm', 'Medium', null, 2),
      await ensureOption(sizeType.variation_type_id, 'l', 'Large', null, 3)
    ];
    // Colors
    const colorOptions = [
      await ensureOption(colorType.variation_type_id, 'black', 'Black', '#000000', 1),
      await ensureOption(colorType.variation_type_id, 'white', 'White', '#FFFFFF', 2),
      await ensureOption(colorType.variation_type_id, 'brown', 'Brown', '#8B4513', 3)
    ];
    // Designs
    const designOptions = [
      await ensureOption(designType.variation_type_id, 'fs-design', 'FS Design Mug', null, 1),
      await ensureOption(designType.variation_type_id, 'cat-design', 'Cat Design Mug', null, 2)
    ];

    // Clear existing FS products
    console.log('\n🧹 Clearing existing FS products...');
    const existingProducts = await db('sl_products')
      .whereIn('name', ['FS Poloshirt', 'FS Tee', 'FS Mug'])
      .select('product_id');
    if (existingProducts.length > 0) {
      const productIds = existingProducts.map(p => p.product_id);
      await db('sl_product_variations').whereIn('product_id', productIds).del();
      await db('sl_products').whereIn('product_id', productIds).del();
      console.log(`✅ Cleared ${existingProducts.length} existing FS products`);
    }

    // Create FS Poloshirt
    console.log('\n👕 Creating FS Poloshirt...');
    const [poloshirtId] = await db('sl_products').insert({
      name: 'FS Poloshirt',
      description: 'Premium FS branded polo shirt with embroidered logo',
      price_points: 800,
      category_id: swagsCategory.category_id,
      is_active: 1,
      slug: 'fs-poloshirt'
    });
    for (const size of sizeOptions) {
      for (const color of colorOptions.filter(c => ['black', 'white'].includes(c.option_value))) {
        const [variationId] = await db('sl_product_variations').insert({
          product_id: poloshirtId,
          variation_sku: `FS-POLO-${size.option_value.toUpperCase()}-${color.option_value.toUpperCase()}`,
          is_active: 1
        });
        await db('sl_product_variation_options').insert({ variation_id: variationId, option_id: size.option_id });
        await db('sl_product_variation_options').insert({ variation_id: variationId, option_id: color.option_id });
        console.log(`   ✅ Created variation: ${size.option_label} - ${color.option_label}`);
      }
    }

    // Create FS Tee
    console.log('\n👕 Creating FS Tee...');
    const [teeId] = await db('sl_products').insert({
      name: 'FS Tee',
      description: 'Comfortable FS branded t-shirt with printed logo',
      price_points: 500,
      category_id: swagsCategory.category_id,
      is_active: 1,
      slug: 'fs-tee'
    });
    for (const size of sizeOptions) {
      for (const color of colorOptions.filter(c => ['black', 'white'].includes(c.option_value))) {
        const [variationId] = await db('sl_product_variations').insert({
          product_id: teeId,
          variation_sku: `FS-TEE-${size.option_value.toUpperCase()}-${color.option_value.toUpperCase()}`,
          is_active: 1
        });
        await db('sl_product_variation_options').insert({ variation_id: variationId, option_id: size.option_id });
        await db('sl_product_variation_options').insert({ variation_id: variationId, option_id: color.option_id });
        console.log(`   ✅ Created variation: ${size.option_label} - ${color.option_label}`);
      }
    }

    // Create FS Mug
    console.log('\n☕ Creating FS Mug...');
    const [mugId] = await db('sl_products').insert({
      name: 'FS Mug',
      description: 'Premium FS branded ceramic mug with custom designs',
      price_points: 300,
      category_id: swagsCategory.category_id,
      is_active: 1,
      slug: 'fs-mug'
    });
    for (const color of colorOptions.filter(c => ['brown', 'white'].includes(c.option_value))) {
      for (const design of designOptions) {
        const [variationId] = await db('sl_product_variations').insert({
          product_id: mugId,
          variation_sku: `FS-MUG-${color.option_value.toUpperCase()}-${design.option_value.toUpperCase()}`,
          is_active: 1
        });
        await db('sl_product_variation_options').insert({ variation_id: variationId, option_id: color.option_id });
        await db('sl_product_variation_options').insert({ variation_id: variationId, option_id: design.option_id });
        console.log(`   ✅ Created variation: ${color.option_label} - ${design.option_label}`);
      }
    }

    console.log('\n🎉 Product seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • FS Poloshirt: 6 variations (S/M/L × Black/White)');
    console.log('   • FS Tee: 6 variations (S/M/L × Black/White)');
    console.log('   • FS Mug: 4 variations (Brown/White × FS Design/Cat Design)');

  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  } finally {
    process.exit(0);
  }
};

seedProducts(); 
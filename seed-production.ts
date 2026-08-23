/**
 * seed-production.ts
 *
 * Standalone seed script for the Railway MySQL database.
 * Run this AFTER `npm run db:push` has created the schema.
 *
 * It uses `DATABASE_URL` from the environment (already set in Railway),
 * so it works whether you run it locally via `railway run` or inside
 * the container via `railway ssh`.
 *
 * Uses INSERT IGNORE so it's safe to re-run without throwing duplicate
 * key errors if some rows already exist.
 *
 * HOW TO RUN:
 *   1) Locally, with Railway env vars injected:
 *        railway run npx tsx seed-production.ts
 *
 *   2) Or inside the container via `railway ssh`:
 *        - Copy this file into the container (see notes at bottom), then:
 *          npx tsx seed-production.ts
 *
 * Requires `mysql2` (already a dependency since Drizzle uses it) and
 * `tsx` (or `ts-node`) to run TypeScript directly. If you don't have
 * tsx available, run `npx tsx seed-production.ts` — npx will fetch it
 * on the fly.
 */

import mysql from "mysql2/promise";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Run this via `railway run` or ensure the env var is exported in your shell."
    );
  }

  console.log("Connecting to database...");
  const connection = await mysql.createConnection(connectionString);

  try {
    console.log("Seeding `dishes`...");
    await connection.query(`
      INSERT IGNORE INTO \`dishes\` (\`id\`, \`name\`, \`nameAr\`, \`description\`, \`descriptionAr\`, \`price\`, \`category\`, \`subcategory\`, \`imageUrl\`, \`featured\`, \`stock\`, \`createdAt\`) VALUES
      (1, 'Molokhia Royale', 'ملوخية رويال', 'The king\\'s soup. Fresh jute leaves in a garlic-infused broth, served with vermicelli rice and slow-roasted chicken.', 'شوربة الملوك. أوراق ملوخية طازجة في مرقة معطرة بالثوم، تُقدم مع أرز بالشعيرية ودجاج مشوي ببطء.', 285.00, 'main', NULL, '/hero-food-molokhia.jpg', 1, NULL, '2026-07-05 16:16:14'),
      (2, 'Koshari ', 'كشري ', 'Cairo\\'s iconic comfort, elevated. Layers of rice, lentils, pasta, and caramelized onions crowned with our secret tomato sauce.', 'أشهر أطباق القاهرة بلمسة راقية. طبقات من الأرز والعدس والمكرونة والبصل المقرمش، متوَّجة بصلصة الطماطم السرية.', 195.00, 'main', NULL, '/hero-food-koshari.jpg', 0, NULL, '2026-07-05 16:16:55'),
      (3, 'Hamam Mahshi', 'حمام محشي', 'Whole pigeon stuffed with fragrant orzo and spiced ground beef, roasted to golden perfection.', 'حمام كامل محشو بالأرز اللسان المعطر واللحم المفروم المتبل، مشوي حتى الذهبية المثالية.', 425.00, 'main', NULL, '/hero-food-hamam.jpg', 1, NULL, '2026-07-05 16:17:31'),
      (4, 'Um Ali Gold', 'أم علي الذهبية', 'Our crown dessert. Puff pastry baked in sweetened milk with raisins, coconut flakes, and crushed pistachios.', 'حلوى تاجنا. عجينة مورقة مخبوزة في حليب محلى مع زبيب ورقائق جوز الهند والفستق المطحون.', 165.00, 'dessert', NULL, '/hero-food-umali.jpg', 1, NULL, '2026-07-05 16:18:13'),
      (5, 'Hawawshi', 'حواوشي', 'A classic Egyptian street food staple; crispy baladi bread stuffed entirely with a savory mixture of spiced minced beef, onions, and peppers, then oven-baked until golden.', 'طبق شعبي مصري كلاسيكي؛ خبز بلدي مقرمش محشو بخليط لذيذ من اللحم المفروم المتبل والبصل والفلفل، مخبوز حتى يصبح ذهبي اللون.', 110.00, 'main', NULL, '/Hawawshi.png', 0, NULL, '2026-07-05 16:36:23'),
      (6, 'Mahshi Warak Enab (Stuffed Grape Leaves)', 'محشي ورق عنب', 'Tender grape leaves tightly rolled and stuffed with a flavorful mixture of rice, herbs, and spices, simmered in a lemony broth.', 'ورق عنب طري ملفوف بإحكام ومحشو بخليط شهي من الأرز والأعشاب والتوابل، مطهو ببطء في مرقة بنكهة الليمون.', 85.00, 'appetizer', NULL, '/Mahshi Warak Enab (Stuffed Grape Leaves).png', 0, NULL, '2026-07-05 16:38:10'),
      (7, 'Konafa with Cream', 'كنافة بالقشطة', 'A beloved Egyptian dessert featuring a crispy, golden-brown shredded phyllo crust soaked in sweet syrup, sandwiching a rich, velvety layer of Eshta (clotted cream).', 'حلوى مصرية محبوبة من كنافة مقرمشة ذهبية منقوعة في شراب حلو، تحتضن طبقة غنية وناعمة من القشطة.', 95.00, 'dessert', NULL, '/Konafa with Cream.png', 0, NULL, '2026-07-05 16:39:03'),
      (8, 'Karkadeh (Hibiscus Tea)', 'كركديه', 'A vibrant, deep-crimson, sweet and slightly tart infusion made from dried hibiscus flowers, served chilled as a refreshing counterpoint to any meal.', 'مشروب أحمر قاني من زهور الكركديه المجففة، حلو ولاذع قليلاً، يُقدم مثلجًا كخيار منعش يوازن أي وجبة.', 35.00, 'beverage', 'tea', '/Karkadeh (Hibiscus Tea).png', 0, NULL, '2026-07-05 16:39:55'),
      (9, 'Grilled Lamb over Rice', 'ريش ضاني مشوية على الأرز', 'Expertly marinated and grilled Egyptian lamb ribs, served on a bed of seasoned rice and garnished with parsley and pomegranate seeds.', 'ريش ضاني مصرية متبلة ومشوية باحترافية، تُقدم فوق طبقة من الأرز المتبل ومزينة بالبقدونس وحبات الرمان.', 320.00, 'main', NULL, '/Grilled Lamb over Rice.png', 1, NULL, '2026-07-05 17:11:29'),
      (10, 'Baba Ganoush', 'بابا غنوج', 'A classic Egyptian roasted eggplant dip, blended with tahini, garlic, and lemon juice. Perfectly paired with fresh warm pita bread.', 'متبل باذنجان مشوي كلاسيكي، ممزوج بالطحينة والثوم وعصير الليمون. يُقدم مع خبز عربي دافئ وطازج.', 65.00, 'appetizer', NULL, '/Baba Ganoush.png', 0, NULL, '2026-07-05 17:13:00'),
      (11, 'Ful Medames', 'فول مدمس', 'Slow-cooked fava beans, a cornerstone of Egyptian cuisine. Served hot with olive oil, cumin, and a twist of lemon, accompanied by a hard-boiled egg.', 'فول مطهو ببطء، ركيزة أساسية في المطبخ المصري. يُقدم ساخنًا مع زيت الزيتون والكمون ولمسة من الليمون، برفقة بيضة مسلوقة.', 55.00, 'breakfast', NULL, '/Ful Medames.png', 0, NULL, '2026-07-05 17:19:56'),
      (12, 'Basbousa', 'بسبوسة', 'A classic, soft Egyptian semolina cake, deeply soaked in a delicate sugar syrup and infused with rose water. A timeless and beloved dessert.', 'كيكة سميد مصرية طرية وكلاسيكية، منقوعة جيدًا بشراب سكري رقيق ومعطرة بماء الورد. حلوى خالدة ومحبوبة.', 45.00, 'dessert', NULL, '/Basbousa.png', 0, NULL, '2026-07-05 17:21:50'),
      (13, 'Roz Bel Laban (Egyptian Rice Pudding)', 'رز بلبن', 'A comforting and creamy classic: Egyptian rice pudding, gently simmered with milk and finished with a torch-caramelized top and chopped nuts.', 'كلاسيكية كريمية ومريحة: أرز باللبن مصري مطهو برفق مع الحليب، ومزين بطبقة مكرملة من الأعلى ومكسرات مفرومة.', 40.00, 'dessert', NULL, '/Roz Bel Laban (Egyptian Rice Pudding).png', 0, NULL, '2026-07-05 17:22:50'),
      (14, 'Feteer Meshaltet', 'فطير مشلتت', 'A flaky, layered Egyptian pastry, brushed with ghee and baked to a golden crisp. Served warm with artisanal honey and black molasses for a classic, comforting breakfast.', 'فطيرة مصرية متعددة الطبقات ومقرمشة، مدهونة بالسمن ومخبوزة حتى تصبح ذهبية اللون. تُقدم دافئة مع العسل والعسل الأسود لإفطار كلاسيكي ومريح.', 95.00, 'breakfast', NULL, '/Feteer Meshaltet.png', 0, NULL, '2026-07-05 17:32:52'),
      (15, 'Mombar', 'ممبار', 'Rice and herb-stuffed casings, fried until golden and crispy on the outside. A savory, flavorful Egyptian appetizer garnished with fresh parsley and sumac, served with a tangy lemon-tahini dip.', 'أمعاء محشوة بالأرز والأعشاب، مقلية حتى تصبح ذهبية ومقرمشة من الخارج. مقبلات مصرية شهية مزينة بالبقدونس الطازج والسماق، تُقدم مع غموس طحينة بالليمون.', 130.00, 'appetizer', NULL, '/Mombar.png', 0, NULL, '2026-07-05 17:34:07'),
      (16, 'Twisted Kunafa', 'كنافة مبرومة', 'Delicate coils of shredded filo dough intricately twisted around a rich Ashta cream filling. Glistening with sweet syrup, topped with crushed pistachios and a candied rose petal.', 'لفائف رقيقة من عجينة الكنافة الملفوفة بعناية حول حشوة غنية من قشطة العشطة. لامعة بالشراب الحلو، ومزينة بالفستق المطحون وبتلة ورد مسكرة.', 110.00, 'dessert', NULL, '/Twisted Kunafa.png', 0, NULL, '2026-07-05 17:35:09'),
      (17, 'Falafel', 'فلافل', 'Perfectly golden-brown fava bean falafel patties dusted with sesame seeds and infused with herbs and spices, served with tahini dip and fresh Aish Baladi.', 'أقراص فلافل من الفول بلون ذهبي مثالي، مرشوشة بحبوب السمسم ومعطرة بالأعشاب والتوابل، تُقدم مع غموس الطحينة والعيش البلدي الطازج.', 80.00, 'breakfast', NULL, '/falafel.png', 0, NULL, '2026-07-05 17:59:02'),
      (18, 'Sahlab', 'سحلب', 'A comforting, thick and creamy milk-based pudding drink, lightly sweetened and perfumed with rose water. Crowned with crushed pistachios, coconut, and cinnamon.', 'مشروب مريح كثيف وكريمي من الحليب، محلى قليلاً ومعطر بماء الورد. متوَّج بالفستق المطحون وجوز الهند والقرفة.', 85.00, 'beverage', 'others', '/Sahlab.png', 0, NULL, '2026-07-05 18:03:24'),
      (19, 'Traditional Mint Tea (Shai bi Nana)', 'شاي بالنعناع', 'Dark amber hot black tea, generously steeped with fresh mint leaves.', 'شاي أسود ساخن بلون كهرماني داكن، منقوع بسخاء بأوراق النعناع الطازجة.', 40.00, 'beverage', 'tea', '/Traditional Mint Tea (Shai bi Nana).png', 0, NULL, '2026-07-05 18:06:54'),
      (20, 'Sugar Cane Juice (Asab)', 'عصير قصب', 'Freshly pressed sugar cane juice served chilled.', 'عصير قصب طازج ومعصور حديثًا، يُقدم مثلجًا.', 45.00, 'beverage', 'others', '/Freshly Pressed Sugar Cane Juice (Asab).png', 0, NULL, '2026-07-05 18:08:44'),
      (21, 'Egyptian Coffee (Ahwa)', 'قهوة مصرية', 'Finely ground, dark-roasted coffee beans simmered with cardamom for a thick, rich traditional coffee.', 'حبوب قهوة محمصة داكنة ومطحونة ناعمًا، مطهوة مع الهيل لقهوة تقليدية كثيفة وغنية.', 35.00, 'beverage', 'coffee', '/Egyptian Coffee (Ahwa).png', 0, NULL, '2026-07-05 19:33:02'),
      (22, 'Tamr Hindi', 'تمر هندي', 'A cool and refreshing tamarind drink, sweetened and served chilled.', 'مشروب تمر هندي بارد ومنعش، محلى ويُقدم مثلجًا.', 40.00, 'beverage', 'others', '/Tamr Hindi.png', 0, NULL, '2026-07-05 19:33:58'),
      (23, 'Sobia (Coconut Rice Drink)', 'سوبيا', 'A creamy Egyptian drink made from rice, milk, coconut milk, and cinnamon.', 'مشروب مصري كريمي مصنوع من الأرز والحليب وحليب جوز الهند والقرفة.', 45.00, 'beverage', 'others', '/Sobia (Coconut Rice Drink).png', 0, NULL, '2026-07-05 19:35:15'),
      (24, 'Karkadeh Hot (Hot Hibiscus Tea)', 'كركديه ساخن', 'A deeply rich, ruby-red hot hibiscus infusion, slightly tart and soothing.', 'مشروب كركديه ساخن غني بلون ياقوتي، لاذع قليلاً ومهدئ.', 30.00, 'beverage', 'tea', '/Karkadeh Hot (Hot Hibiscus Tea).png', 0, NULL, '2026-07-05 19:36:11');
    `);

    console.log("Seeding `users`...");
    await connection.query(`
      INSERT IGNORE INTO \`users\` (\`id\`, \`email\`, \`passwordHash\`, \`name\`, \`avatar\`, \`role\`, \`createdAt\`, \`updatedAt\`, \`lastSignInAt\`) VALUES
      (1, 'admin@gmail.com', '20ee1baae098f5cf47c46a11e32f75a1:3d3d2be338415a7740d1d61256194ed4c3663f180f029e004c05a26271548e63e4016e173534246c80b91bef4a5849cd0bd4f49c26231f92ad81bfe31bed7937', 'admin', NULL, 'admin', '2026-07-05 15:51:23', '2026-08-08 09:26:10', '2026-08-08 09:26:10'),
      (2, 'nancy@gmail.com', '48b9aa1075eee87f72d141e88c04b370:a931fd75b0b47dfe49cd0b2d743d96465d9c1e73282aa9c1bdf28c997d8ce34eaaa5b274c39c9778a77c35c8ae368a829d369209c8e35e38a4b43b84f27c9560', 'Nancy Abduallh', NULL, 'user', '2026-07-05 17:36:57', '2026-08-08 09:26:55', '2026-08-08 09:26:55'),
      (3, 'mazen@gmail.com', '0cb8d6617e132fa39925f5fa3c564dd0:ec7f9d696f93ba934cc5211a859c9c888e6e48c425884cfb980a6a58e85cb27857182e918045fecba4c87da8ff49a558e2c50c3fac2cba1c53ba231a9297f2e7', 'Mazen', NULL, 'user', '2026-07-05 17:46:38', '2026-07-05 17:46:38', '2026-07-05 17:46:38');
    `);

    console.log("Seeding `page_views`... (skipping — analytics data, not needed in production)");
    // page_views is just historical traffic logs from your dev DB.
    // Uncomment below only if you actually want that noise carried over to production.
    /*
    await connection.query(`
      INSERT IGNORE INTO \`page_views\` (\`id\`, \`path\`, \`createdAt\`) VALUES
      (1, '/', '2026-07-18 02:33:11'),
      ...
    `);
    */

    console.log("✅ Seed complete.");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

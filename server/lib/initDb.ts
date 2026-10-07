// server/lib/initDb.ts
import { getDb } from "../queries/connection";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const TABLE_CREATIONS = [
  `CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`email\` VARCHAR(320) NOT NULL UNIQUE,
    \`passwordHash\` VARCHAR(255) NOT NULL,
    \`name\` VARCHAR(255),
    \`avatar\` TEXT,
    \`role\` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    \`lastSignInAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`dishes\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`name\` VARCHAR(100) NOT NULL,
    \`nameAr\` VARCHAR(100),
    \`description\` TEXT,
    \`descriptionAr\` TEXT,
    \`price\` DECIMAL(10, 2) NOT NULL,
    \`category\` ENUM('appetizer', 'main', 'dessert', 'beverage', 'breakfast') NOT NULL,
    \`subcategory\` ENUM('coffee', 'tea', 'others'),
    \`imageUrl\` VARCHAR(255),
    \`featured\` BOOLEAN DEFAULT FALSE,
    \`stock\` INT,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`tables\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`tableNumber\` VARCHAR(20) NOT NULL UNIQUE,
    \`seats\` INT,
    \`area\` VARCHAR(50),
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`table_qr_codes\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`tableId\` INT NOT NULL,
    \`code\` VARCHAR(64) NOT NULL UNIQUE,
    \`label\` VARCHAR(50),
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`table_order_batches\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`tableId\` INT NOT NULL,
    \`tableNumber\` VARCHAR(20) NOT NULL,
    \`status\` ENUM('open', 'sent_to_kitchen', 'cancelled') NOT NULL DEFAULT 'open',
    \`opensAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`sendAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`sentAt\` DATETIME
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`orders\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`userId\` INT NOT NULL,
    \`status\` ENUM('pending_edit', 'pending', 'preparing', 'ready', 'served', 'cancelled') NOT NULL DEFAULT 'pending',
    \`totalAmount\` DECIMAL(10, 2) NOT NULL,
    \`notes\` TEXT,
    \`tableId\` INT NOT NULL,
    \`tableNumber\` VARCHAR(20) NOT NULL,
    \`batchId\` INT NOT NULL,
    \`editableUntil\` DATETIME NOT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`order_items\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`orderId\` INT NOT NULL,
    \`dishId\` INT NOT NULL,
    \`dishName\` VARCHAR(100) NOT NULL,
    \`unitPrice\` DECIMAL(10, 2) NOT NULL,
    \`quantity\` INT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`reservations\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`userId\` INT NOT NULL,
    \`name\` VARCHAR(100) NOT NULL,
    \`email\` VARCHAR(100) NOT NULL,
    \`phone\` VARCHAR(20),
    \`date\` DATE NOT NULL,
    \`time\` TIME NOT NULL,
    \`guests\` INT NOT NULL,
    \`notes\` TEXT,
    \`preferredArea\` VARCHAR(100),
    \`tableId\` INT,
    \`tableNumber\` VARCHAR(20),
    \`status\` ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY \`reservations_table_date_time_unique\` (\`tableId\`, \`date\`, \`time\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`reviews\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`userId\` INT NOT NULL,
    \`rating\` INT NOT NULL,
    \`comment\` TEXT,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS \`page_views\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`path\` VARCHAR(255) NOT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
];

const DEFAULT_DISHES = [
  { id: 1, name: "Molokhia Royale", nameAr: "ملوخية رويال", desc: "The king's soup. Fresh jute leaves in a garlic-infused broth, served with vermicelli rice and slow-roasted chicken.", descAr: "شوربة الملوك. أوراق ملوخية طازجة في مرقة معطرة بالثوم، تُقدم مع أرز بالشعيرية ودجاج مشوي ببطء.", price: "285.00", category: "main", sub: null, img: "/hero-food-molokhia.jpg", featured: 1 },
  { id: 2, name: "Koshari", nameAr: "كشري", desc: "Cairo's iconic comfort, elevated. Layers of rice, lentils, pasta, and caramelized onions crowned with our secret tomato sauce.", descAr: "أشهر أطباق القاهرة بلمسة راقية. طبقات من الأرز والعدس والمكرونة والبصل المقرمش، متوَّجة بصلصة الطماطم السرية.", price: "195.00", category: "main", sub: null, img: "/hero-food-koshari.jpg", featured: 0 },
  { id: 3, name: "Hamam Mahshi", nameAr: "حمام محشي", desc: "Whole pigeon stuffed with fragrant orzo and spiced ground beef, roasted to golden perfection.", descAr: "حمام كامل محشو بالأرز اللسان المعطر واللحم المفروم المتبل، مشوي حتى الذهبية المثالية.", price: "425.00", category: "main", sub: null, img: "/hero-food-hamam.jpg", featured: 1 },
  { id: 4, name: "Um Ali Gold", nameAr: "أم علي الذهبية", desc: "Our crown dessert. Puff pastry baked in sweetened milk with raisins, coconut flakes, and crushed pistachios.", descAr: "حلوى تاجنا. عجينة مورقة مخبوزة في حليب محلى مع زبيب ورقائق جوز الهند والفستق المطحون.", price: "165.00", category: "dessert", sub: null, img: "/hero-food-umali.jpg", featured: 1 },
  { id: 5, name: "Hawawshi", nameAr: "حواوشي", desc: "A classic Egyptian street food staple; crispy baladi bread stuffed entirely with a savory mixture of spiced minced beef.", descAr: "طبق شعبي مصري كلاسيكي؛ خبز بلدي مقرمش محشو بخليط لذيذ من اللحم المفروم المتبل.", price: "110.00", category: "main", sub: null, img: "/Hawawshi.png", featured: 0 },
  { id: 6, name: "Mahshi Warak Enab", nameAr: "محشي ورق عنب", desc: "Tender grape leaves tightly rolled and stuffed with a flavorful mixture of rice, herbs, and spices.", descAr: "ورق عنب طري ملفوف بإحكام ومحشو بخليط شهي من الأرز والأعشاب والتوابل.", price: "85.00", category: "appetizer", sub: null, img: "/Mahshi Warak Enab (Stuffed Grape Leaves).png", featured: 0 },
  { id: 7, name: "Konafa with Cream", nameAr: "كنافة بالقشطة", desc: "A beloved Egyptian dessert featuring crispy golden phyllo soaked in sweet syrup with velvety cream.", descAr: "حلوى مصرية محبوبة من كنافة مقرمشة ذهبية منقوعة في شراب حلو مع القشطة.", price: "95.00", category: "dessert", sub: null, img: "/Konafa with Cream.png", featured: 0 },
  { id: 8, name: "Karkadeh (Hibiscus Tea)", nameAr: "كركديه", desc: "A vibrant, sweet and slightly tart infusion made from dried hibiscus flowers, served chilled.", descAr: "مشروب أحمر قاني من زهور الكركديه المجففة، حلو ولاذع قليلاً، يُقدم مثلجًا.", price: "35.00", category: "beverage", sub: "tea", img: "/Karkadeh (Hibiscus Tea).png", featured: 0 },
  { id: 9, name: "Grilled Lamb over Rice", nameAr: "ريش ضاني مشوية على الأرز", desc: "Expertly marinated and grilled Egyptian lamb ribs, served on a bed of seasoned rice.", descAr: "ريش ضاني مصرية متبلة ومشوية باحترافية، تُقدم فوق طبقة من الأرز المتبل.", price: "320.00", category: "main", sub: null, img: "/Grilled Lamb over Rice.png", featured: 1 },
  { id: 10, name: "Baba Ganoush", nameAr: "بابا غنوج", desc: "A classic Egyptian roasted eggplant dip, blended with tahini, garlic, and lemon juice.", descAr: "متبل باذنجان مشوي كلاسيكي، ممزوج بالطحينة والثوم وعصير الليمون.", price: "65.00", category: "appetizer", sub: null, img: "/Baba Ganoush.png", featured: 0 },
  { id: 11, name: "Ful Medames", nameAr: "فول مدمس", desc: "Slow-cooked fava beans with olive oil, cumin, and lemon, accompanied by a hard-boiled egg.", descAr: "فول مطهو ببطء مع زيت الزيتون والكمون والليمون، برفقة بيضة مسلوقة.", price: "55.00", category: "breakfast", sub: null, img: "/Ful Medames.png", featured: 0 },
  { id: 12, name: "Basbousa", nameAr: "بسبوسة", desc: "A classic, soft Egyptian semolina cake, deeply soaked in a delicate sugar syrup.", descAr: "كيكة سميد مصرية طرية وكلاسيكية، منقوعة بشراب سكري رقيق.", price: "45.00", category: "dessert", sub: null, img: "/Basbousa.png", featured: 0 },
  { id: 13, name: "Roz Bel Laban", nameAr: "رز بلبن", desc: "Egyptian rice pudding, gently simmered with milk and finished with chopped nuts.", descAr: "أرز باللبن مصري مطهو برفق مع الحليب، ومزين بالمكسرات.", price: "40.00", category: "dessert", sub: null, img: "/Roz Bel Laban (Egyptian Rice Pudding).png", featured: 0 },
  { id: 14, name: "Feteer Meshaltet", nameAr: "فطير مشلتت", desc: "Flaky layered Egyptian pastry, brushed with ghee and baked golden, served with honey.", descAr: "فطيرة مصرية متعددة الطبقات مدهونة بالسمن ومخبوزة حتى تصبح ذهبية.", price: "95.00", category: "breakfast", sub: null, img: "/Feteer Meshaltet.png", featured: 0 },
  { id: 15, name: "Mombar", nameAr: "ممبار", desc: "Rice and herb-stuffed casings, fried until golden and crispy.", descAr: "أمعاء محشوة بالأرز والأعشاب، مقلية حتى تصبح ذهبية ومقرمشة.", price: "130.00", category: "appetizer", sub: null, img: "/Mombar.png", featured: 0 },
  { id: 16, name: "Twisted Kunafa", nameAr: "كنافة مبرومة", desc: "Delicate coils of shredded filo dough intricately twisted around a rich Ashta cream filling.", descAr: "لفائف رقيقة من عجينة الكنافة الملفوفة بعناية حول حشوة غنية من قشطة العشطة.", price: "110.00", category: "dessert", sub: null, img: "/Twisted Kunafa.png", featured: 0 },
  { id: 17, name: "Falafel", nameAr: "فلافل", desc: "Crispy fava bean falafel patties with sesame seeds, herbs, and spices, served with tahini.", descAr: "أقراص فلافل من الفول بلون ذهبي، مرشوشة بالسمسم والأعشاب، تُقدم مع الطحينة.", price: "80.00", category: "breakfast", sub: null, img: "/falafel.png", featured: 0 },
  { id: 18, name: "Sahlab", nameAr: "سحلب", desc: "Creamy milk-based pudding drink, perfumed with rose water, pistachios, and cinnamon.", descAr: "مشروب مريح كثيف وكريمي من الحليب مع الفستق والقرفة.", price: "85.00", category: "beverage", sub: "others", img: "/Sahlab.png", featured: 0 },
  { id: 19, name: "Traditional Mint Tea", nameAr: "شاي بالنعناع", desc: "Hot black tea steeped with fragrant fresh mint leaves.", descAr: "شاي أسود ساخن منقوع بأوراق النعناع الطازجة.", price: "40.00", category: "beverage", sub: "tea", img: "/Traditional Mint Tea (Shai bi Nana).png", featured: 0 },
  { id: 20, name: "Sugar Cane Juice", nameAr: "عصير قصب", desc: "Freshly pressed sugar cane juice served chilled.", descAr: "عصير قصب طازج ومعصور حديثًا، يُقدم مثلجًا.", price: "45.00", category: "beverage", sub: "others", img: "/Freshly Pressed Sugar Cane Juice (Asab).png", featured: 0 },
  { id: 21, name: "Egyptian Coffee (Ahwa)", nameAr: "قهوة مصرية", desc: "Finely ground dark coffee simmered with cardamom for a rich traditional brew.", descAr: "حبوب قهوة مطحونة ناعمًا مطهوة مع الهيل لقهوة تقليدية غنية.", price: "35.00", category: "beverage", sub: "coffee", img: "/Egyptian Coffee (Ahwa).png", featured: 0 },
  { id: 22, name: "Tamr Hindi", nameAr: "تمر هندي", desc: "Cool and refreshing sweet tamarind drink, served chilled.", descAr: "مشروب تمر هندي بارد ومنعش، محلى ويُقدم مثلجًا.", price: "40.00", category: "beverage", sub: "others", img: "/Tamr Hindi.png", featured: 0 },
  { id: 23, name: "Sobia", nameAr: "سوبيا", desc: "Creamy Egyptian beverage made from rice, coconut milk, and cinnamon.", descAr: "مشروب مصري كريمي مصنوع من الأرز وحليب جوز الهند والقرفة.", price: "45.00", category: "beverage", sub: "others", img: "/Sobia (Coconut Rice Drink).png", featured: 0 },
  { id: 24, name: "Karkadeh Hot", nameAr: "كركديه ساخن", desc: "Ruby-red hot hibiscus infusion, soothing and aromatic.", descAr: "مشروب كركديه ساخن غني بلون ياقوتي مهدئ وعطري.", price: "30.00", category: "beverage", sub: "tea", img: "/Karkadeh Hot (Hot Hibiscus Tea).png", featured: 0 },
];

const DEFAULT_TABLES = [
  { tableNumber: "1", seats: 2, qrCount: 2, area: "window" },
  { tableNumber: "2", seats: 2, qrCount: 2, area: "window" },
  { tableNumber: "3", seats: 4, qrCount: 4, area: "main" },
  { tableNumber: "4", seats: 4, qrCount: 4, area: "main" },
  { tableNumber: "5", seats: 4, qrCount: 4, area: "stage" },
  { tableNumber: "6", seats: 6, qrCount: 6, area: "main" },
  { tableNumber: "7", seats: 6, qrCount: 6, area: "stage" },
  { tableNumber: "8", seats: 8, qrCount: 4, area: "main" },
  { tableNumber: "T1", seats: 4, qrCount: 4, area: "terrace" },
  { tableNumber: "T2", seats: 4, qrCount: 4, area: "terrace" },
];

export async function initDatabase() {
  try {
    const db = getDb();

    console.log("[db-init] Ensuring tables exist...");
    for (const ddl of TABLE_CREATIONS) {
      await db.execute(sql.raw(ddl));
    }
    console.log("[db-init] Tables ready.");

    // Check dishes
    const dishCountResult: any = await db.execute(sql.raw("SELECT COUNT(*) as count FROM `dishes`"));
    const dishCount = Number(dishCountResult[0]?.[0]?.count ?? dishCountResult[0]?.count ?? 0);

    if (dishCount === 0) {
      console.log("[db-init] Seeding default dishes...");
      for (const d of DEFAULT_DISHES) {
        await db.execute(sql`
          INSERT IGNORE INTO \`dishes\` 
          (\`id\`, \`name\`, \`nameAr\`, \`description\`, \`descriptionAr\`, \`price\`, \`category\`, \`subcategory\`, \`imageUrl\`, \`featured\`)
          VALUES (${d.id}, ${d.name}, ${d.nameAr}, ${d.desc}, ${d.descAr}, ${d.price}, ${d.category}, ${d.sub}, ${d.img}, ${d.featured})
        `);
      }
      console.log("[db-init] Seeded dishes.");
    }

    // Check users
    const userCountResult: any = await db.execute(sql.raw("SELECT COUNT(*) as count FROM `users`"));
    const userCount = Number(userCountResult[0]?.[0]?.count ?? userCountResult[0]?.count ?? 0);

    if (userCount === 0) {
      console.log("[db-init] Seeding admin user...");
      await db.execute(sql`
        INSERT IGNORE INTO \`users\` 
        (\`id\`, \`email\`, \`passwordHash\`, \`name\`, \`role\`)
        VALUES 
        (1, 'admin@gmail.com', '20ee1baae098f5cf47c46a11e32f75a1:3d3d2be338415a7740d1d61256194ed4c3663f180f029e004c05a26271548e63e4016e173534246c80b91bef4a5849cd0bd4f49c26231f92ad81bfe31bed7937', 'admin', 'admin'),
        (2, 'nancy@gmail.com', '48b9aa1075eee87f72d141e88c04b370:a931fd75b0b47dfe49cd0b2d743d96465d9c1e73282aa9c1bdf28c997d8ce34eaaa5b274c39c9778a77c35c8ae368a829d369209c8e35e38a4b43b84f27c9560', 'Nancy Abduallh', 'user')
      `);
      console.log("[db-init] Seeded users.");
    }

    // Check tables
    const tableCountResult: any = await db.execute(sql.raw("SELECT COUNT(*) as count FROM \`tables\`"));
    const tableCount = Number(tableCountResult[0]?.[0]?.count ?? tableCountResult[0]?.count ?? 0);

    if (tableCount === 0) {
      console.log("[db-init] Seeding dining tables and QR codes...");
      for (const t of DEFAULT_TABLES) {
        await db.execute(sql`
          INSERT IGNORE INTO \`tables\` (\`tableNumber\`, \`seats\`, \`area\`)
          VALUES (${t.tableNumber}, ${t.seats}, ${t.area})
        `);

        const insertedTable: any = await db.execute(sql`SELECT \`id\` FROM \`tables\` WHERE \`tableNumber\` = ${t.tableNumber}`);
        const tableId = insertedTable[0]?.[0]?.id ?? insertedTable[0]?.id;

        if (tableId) {
          for (let i = 1; i <= t.qrCount; i++) {
            const code = nanoid(10);
            const label = t.qrCount === 1 ? undefined : `Seat ${i}`;
            await db.execute(sql`
              INSERT IGNORE INTO \`table_qr_codes\` (\`tableId\`, \`code\`, \`label\`)
              VALUES (${tableId}, ${code}, ${label})
            `);
          }
        }
      }
      console.log("[db-init] Seeded dining tables.");
    }

    console.log("[db-init] Database initialized successfully.");
  } catch (error) {
    console.error("[db-init] Warning: automatic database initialization encountered an error:", error);
  }
}

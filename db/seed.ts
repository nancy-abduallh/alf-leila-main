import { getDb } from "../server/queries/connection";
import { dishes } from "./schema";

async function seed() {
  const db = getDb();

  const existing = await db.select().from(dishes);
  if (existing.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  const menuItems = [
    {
      name: "Molokhia Royale",
      nameAr: "ملوخية رويال",
      description: "The king's soup. Fresh jute leaves in a garlic-infused broth, served with vermicelli rice and slow-roasted chicken.",
      descriptionAr: "شوربة الملوك. أوراق ملوخية طازجة في مرقة معطرة بالثوم، تُقدم مع أرز بالشعيرية ودجاج مشوي ببطء.",
      price: "285.00",
      category: "main" as const,
      imageUrl: "/hero-food-molokhia.jpg",
      featured: true,
    },
    {
      name: "Koshari Imperial",
      nameAr: "كشري إمبريال",
      description: "Cairo's iconic comfort, elevated. Layers of rice, lentils, pasta, and caramelized onions crowned with our secret tomato sauce.",
      descriptionAr: "أشهر أطباق القاهرة بلمسة راقية. طبقات من الأرز والعدس والمكرونة والبصل المقرمش، متوَّجة بصلصة الطماطم السرية.",
      price: "195.00",
      category: "main" as const,
      imageUrl: "/hero-food-koshari.jpg",
      featured: true,
    },
    {
      name: "Hamam Mahshi",
      nameAr: "حمام محشي",
      description: "Whole pigeon stuffed with fragrant orzo and spiced ground beef, roasted to golden perfection.",
      descriptionAr: "حمام كامل محشو بالأرز اللسان المعطر واللحم المفروم المتبل، مشوي حتى الذهبية المثالية.",
      price: "425.00",
      category: "main" as const,
      imageUrl: "/hero-food-hamam.jpg",
      featured: true,
    },
    {
      name: "Um Ali Gold",
      nameAr: "أم علي الذهبية",
      description: "Our crown dessert. Puff pastry baked in sweetened milk with raisins, coconut flakes, and crushed pistachios.",
      descriptionAr: "حلوى تاجنا. عجينة مورقة مخبوزة في حليب محلى مع زبيب ورقائق جوز الهند والفستق المطحون.",
      price: "165.00",
      category: "dessert" as const,
      imageUrl: "/hero-food-umali.jpg",
      featured: true,
    },
    {
      name: "Hummus Beiruti",
      nameAr: "حمص بيروتي",
      description: "Creamy chickpea dip blended with tahini, garlic, and a kick of spicy peppers. Served with warm pita bread.",
      descriptionAr: "غموس حمص كريمي مع الطحينة والثوم ولمسة من الفلفل الحار، يُقدم مع خبز عربي دافئ.",
      price: "85.00",
      category: "appetizer" as const,
      imageUrl: "/hero-food-molokhia.jpg",
      featured: false,
    },
    {
      name: "Falafel Crispy",
      nameAr: "فلافل مقرمشة",
      description: "Golden-fried falafel made with fava beans and fresh herbs. Served with tahini sauce and pickled vegetables.",
      descriptionAr: "فلافل مقلية ذهبية من الفول والأعشاب الطازجة، تُقدم مع صلصة الطحينة والمخللات.",
      price: "75.00",
      category: "appetizer" as const,
      imageUrl: "/hero-food-koshari.jpg",
      featured: false,
    },
    {
      name: "Baba Ganoush",
      nameAr: "بابا غنوج",
      description: "Smoky roasted eggplant dip with tahini, lemon, and olive oil. Garnished with pomegranate seeds.",
      descriptionAr: "متبل باذنجان مشوي بنكهة مدخنة مع الطحينة والليمون وزيت الزيتون، مزين بحبات الرمان.",
      price: "90.00",
      category: "appetizer" as const,
      imageUrl: "/hero-food-hamam.jpg",
      featured: false,
    },
    {
      name: "Kunafa Nabulsia",
      nameAr: "كنافة نابلسية",
      description: "Crispy shredded phyllo dough layered with sweet cheese, soaked in orange blossom syrup.",
      descriptionAr: "كنافة مقرمشة محشوة بالجبنة الحلوة ومنقوعة بشراب مزهر البرتقال.",
      price: "145.00",
      category: "dessert" as const,
      imageUrl: "/hero-food-umali.jpg",
      featured: false,
    },
    {
      name: "Basbousa",
      nameAr: "بسبوسة",
      description: "Semolina cake soaked in fragrant rose water syrup, topped with almonds.",
      descriptionAr: "كيكة السميد المنقوعة بشراب ماء الورد العطر، ومزينة باللوز.",
      price: "95.00",
      category: "dessert" as const,
      imageUrl: "/hero-food-molokhia.jpg",
      featured: false,
    },
    {
      name: "Egyptian Mint Tea",
      nameAr: "شاي بالنعناع",
      description: "Freshly brewed black tea with handfuls of fragrant mint leaves. Served in traditional glass cups.",
      descriptionAr: "شاي أسود طازج مع حفنات من أوراق النعناع العطرة، يُقدم في أكواب زجاجية تقليدية.",
      price: "35.00",
      category: "beverage" as const,
      subcategory: "tea" as const,
      imageUrl: "/hero-food-koshari.jpg",
      featured: false,
    },
    {
      name: "Sahlab",
      nameAr: "سحلب",
      description: "Warm and comforting orchid root drink, thickened to perfection, topped with coconut and cinnamon.",
      descriptionAr: "مشروب السحلب الدافئ والمريح، بقوام مثالي، مزين بجوز الهند والقرفة.",
      price: "55.00",
      category: "beverage" as const,
      subcategory: "others" as const,
      imageUrl: "/hero-food-hamam.jpg",
      featured: false,
    },
    {
      name: "Tamarind Juice",
      nameAr: "عصير تمر هندي",
      description: "Sweet and tangy tamarind drink served chilled. A refreshing Egyptian classic.",
      descriptionAr: "عصير تمر هندي حلو ومنعش يُقدم مثلجًا، كلاسيكية مصرية أصيلة.",
      price: "45.00",
      category: "beverage" as const,
      subcategory: "others" as const,
      imageUrl: "/hero-food-umali.jpg",
      featured: false,
    },
  ];

  for (const item of menuItems) {
    await db.insert(dishes).values(item);
  }

  console.log(`Seeded ${menuItems.length} dishes.`);
}

seed().catch(console.error);
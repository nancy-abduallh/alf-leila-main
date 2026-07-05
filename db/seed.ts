import { getDb } from "../api/queries/connection";
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
      description: "The king's soup. Fresh jute leaves in a garlic-infused broth, served with vermicelli rice and slow-roasted chicken.",
      price: "285.00",
      category: "main" as const,
      imageUrl: "/hero-food-molokhia.jpg",
      featured: true,
    },
    {
      name: "Koshari Imperial",
      description: "Cairo's iconic comfort, elevated. Layers of rice, lentils, pasta, and caramelized onions crowned with our secret tomato sauce.",
      price: "195.00",
      category: "main" as const,
      imageUrl: "/hero-food-koshari.jpg",
      featured: true,
    },
    {
      name: "Hamam Mahshi",
      description: "Whole pigeon stuffed with fragrant orzo and spiced ground beef, roasted to golden perfection.",
      price: "425.00",
      category: "main" as const,
      imageUrl: "/hero-food-hamam.jpg",
      featured: true,
    },
    {
      name: "Um Ali Gold",
      description: "Our crown dessert. Puff pastry baked in sweetened milk with raisins, coconut flakes, and crushed pistachios.",
      price: "165.00",
      category: "dessert" as const,
      imageUrl: "/hero-food-umali.jpg",
      featured: true,
    },
    {
      name: "Hummus Beiruti",
      description: "Creamy chickpea dip blended with tahini, garlic, and a kick of spicy peppers. Served with warm pita bread.",
      price: "85.00",
      category: "appetizer" as const,
      imageUrl: "/hero-food-molokhia.jpg",
      featured: false,
    },
    {
      name: "Falafel Crispy",
      description: "Golden-fried falafel made with fava beans and fresh herbs. Served with tahini sauce and pickled vegetables.",
      price: "75.00",
      category: "appetizer" as const,
      imageUrl: "/hero-food-koshari.jpg",
      featured: false,
    },
    {
      name: "Baba Ganoush",
      description: "Smoky roasted eggplant dip with tahini, lemon, and olive oil. Garnished with pomegranate seeds.",
      price: "90.00",
      category: "appetizer" as const,
      imageUrl: "/hero-food-hamam.jpg",
      featured: false,
    },
    {
      name: "Kunafa Nabulsia",
      description: "Crispy shredded phyllo dough layered with sweet cheese, soaked in orange blossom syrup.",
      price: "145.00",
      category: "dessert" as const,
      imageUrl: "/hero-food-umali.jpg",
      featured: false,
    },
    {
      name: "Basbousa",
      description: "Semolina cake soaked in fragrant rose water syrup, topped with almonds.",
      price: "95.00",
      category: "dessert" as const,
      imageUrl: "/hero-food-molokhia.jpg",
      featured: false,
    },
    {
      name: "Egyptian Mint Tea",
      description: "Freshly brewed black tea with handfuls of fragrant mint leaves. Served in traditional glass cups.",
      price: "35.00",
      category: "beverage" as const,
      imageUrl: "/hero-food-koshari.jpg",
      featured: false,
    },
    {
      name: "Sahlab",
      description: "Warm and comforting orchid root drink, thickened to perfection, topped with coconut and cinnamon.",
      price: "55.00",
      category: "beverage" as const,
      imageUrl: "/hero-food-hamam.jpg",
      featured: false,
    },
    {
      name: "Tamarind Juice",
      description: "Sweet and tangy tamarind drink served chilled. A refreshing Egyptian classic.",
      price: "45.00",
      category: "beverage" as const,
      imageUrl: "/hero-food-umali.jpg",
      featured: false,
    },
  ];

  for (const item of menuItems) {
    await db.insert(dishes).values(item);
  }

  console.log("Seeded ${menuItems.length} dishes.");
}

seed().catch(console.error);

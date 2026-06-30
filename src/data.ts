import { Flavor, Topping, GalleryItem } from "./types";

export const FLAVORS: Flavor[] = [
  {
    id: "acai",
    name: "Acai",
    subtitle: "Antioxidant Rich | Tropical Twist | Pure Berries",
    description: "Packed with antioxidants and a tropical twist",
    color: "purple",
    bgLightHex: "#ebd0e4",
    bgDarkHex: "#82298a",
    cupImg: "https://frochi.ae/wp-content/uploads/2025/09/01-Acai-Plain-Cutout.png",
    accentHex: "#ca67a8",
    fruits: [
      { name: "Blueberries", img: "https://frochi.ae/wp-content/uploads/2025/09/Blueberries.jpeg" },
      { name: "Banana", img: "https://frochi.ae/wp-content/uploads/2025/09/Banana.jpeg" },
      { name: "Strawberry", img: "https://frochi.ae/wp-content/uploads/2025/07/strbry-circle.png" },
      { name: "Cherries", img: "https://frochi.ae/wp-content/uploads/2025/09/Cherries.jpeg" }
    ],
    nutritionalInfo: {
      probiotics: "5 Billion CFU",
      calories: 190,
      protein: "4.8g",
      fiber: "5.6g"
    }
  },
  {
    id: "coconut",
    name: "Coconut",
    subtitle: "Creamy Coconut | Plant-Based Froyo | Tropical Vibe",
    description: "Creamy and plant-based for a guilt-free dessert.",
    color: "cream",
    bgLightHex: "#f2f4ee",
    bgDarkHex: "#6d775c",
    cupImg: "https://frochi.ae/wp-content/uploads/2025/09/08-Coconut-Plain-Cutout.png",
    accentHex: "#8d9972",
    fruits: [
      { name: "Coconut Shreds", img: "https://frochi.ae/wp-content/uploads/2025/09/Coconut-Shreds.jpeg" },
      { name: "Pineapple", img: "https://frochi.ae/wp-content/uploads/2025/09/Pineapple.jpeg" },
      { name: "Banana", img: "https://frochi.ae/wp-content/uploads/2025/09/Banana.jpeg" }
    ],
    nutritionalInfo: {
      probiotics: "5 Billion CFU",
      calories: 185,
      protein: "4.2g",
      fiber: "3.8g"
    }
  },
  {
    id: "matcha",
    name: "Matcha",
    subtitle: "Japanese Matcha | Earthy Blend | Natural Energy",
    description: "A vibrant, earthy blend rich in antioxidants and natural energy.",
    color: "green",
    bgLightHex: "#e8eeae",
    bgDarkHex: "#60bb49",
    cupImg: "https://frochi.ae/wp-content/uploads/2025/09/05-Matcha-Plain-Cutout.png",
    accentHex: "#8bc751",
    fruits: [
      { name: "Avocado", img: "https://frochi.ae/wp-content/uploads/2025/09/Avocado.jpeg" },
      { name: "Banana", img: "https://frochi.ae/wp-content/uploads/2025/09/Banana.jpeg" },
      { name: "Kiwi", img: "https://frochi.ae/wp-content/uploads/2025/09/Kiwi.jpeg" }
    ],
    nutritionalInfo: {
      probiotics: "6 Billion CFU",
      calories: 175,
      protein: "5.0g",
      fiber: "4.5g"
    }
  },
  {
    id: "taro",
    name: "Taro",
    subtitle: "Nutty Taro | Sweet Vanilla | Creamy Vibes",
    description: "Smooth, creamy vibes with a hint of nuttiness and vanilla-like sweetness.",
    color: "purple-light",
    bgLightHex: "#e2d9f3",
    bgDarkHex: "#68509c",
    cupImg: "https://frochi.ae/wp-content/uploads/2025/09/06-Taro-Plain-Cutout.png",
    accentHex: "#8a6bc7",
    fruits: [
      { name: "Coconut Shreds", img: "https://frochi.ae/wp-content/uploads/2025/09/Coconut-Shreds.jpeg" },
      { name: "Blueberries", img: "https://frochi.ae/wp-content/uploads/2025/09/Blueberries.jpeg" },
      { name: "Banana", img: "https://frochi.ae/wp-content/uploads/2025/09/Banana.jpeg" }
    ],
    nutritionalInfo: {
      probiotics: "5 Billion CFU",
      calories: 195,
      protein: "4.6g",
      fiber: "3.5g"
    }
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel",
    subtitle: "Sweet Caramel | Sea Salt | Decadent Taste",
    description: "A deliciously decadent twist on the classic caramel favorite.",
    color: "amber",
    bgLightHex: "#fbf3db",
    bgDarkHex: "#ca8a04",
    cupImg: "https://frochi.ae/wp-content/uploads/2025/09/07-Salted-Caramel-Plain-Cutout.png",
    accentHex: "#eab308",
    fruits: [
      { name: "Granola", img: "https://frochi.ae/wp-content/uploads/2025/09/Granola.jpeg" },
      { name: "Banana", img: "https://frochi.ae/wp-content/uploads/2025/09/Banana.jpeg" }
    ],
    nutritionalInfo: {
      probiotics: "5 Billion CFU",
      calories: 210,
      protein: "4.5g",
      fiber: "2.5g"
    }
  }
];


export const TOPPINGS: Topping[] = [
  { id: "granola", name: "Premium Granola", price: 2.5, img: "https://frochi.ae/wp-content/uploads/2025/09/Granola.jpeg", color: "amber" },
  { id: "strawberries", name: "Strawberry Chunks", price: 3.0, img: "https://frochi.ae/wp-content/uploads/2025/07/strbry-circle.png", color: "rose" },
  { id: "chocolate_soil", name: "Chocolate Soil", price: 2.5, img: "https://frochi.ae/wp-content/uploads/2025/09/Chocolate-Soil.jpeg", color: "stone" },
  { id: "chia_seeds", name: "Chia Seeds", price: 1.5, img: "https://frochi.ae/wp-content/uploads/2025/09/Chia-Seeds.jpeg", color: "indigo" },
  { id: "mango_chunks", name: "Kensington Mango", price: 3.5, img: "https://frochi.ae/wp-content/uploads/2025/07/mango.png", color: "orange" },
  { id: "oreo_biscuits", name: "Crushed Oreo", price: 2.0, img: "https://frochi.ae/wp-content/uploads/2025/09/Oreo-Biscuits.jpeg", color: "neutral" }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    title: "Venue",
    subtitle: "Step into our Venues",
    img: "https://frochi.ae/wp-content/uploads/2025/07/9-1.png"
  },
  {
    title: "Yogurts",
    subtitle: "Our Yogurt is your canvas",
    img: "https://frochi.ae/wp-content/uploads/2025/07/8-1.png"
  },
  {
    title: "Yogurts",
    subtitle: "Our Yogurt is your canvas",
    img: "https://frochi.ae/wp-content/uploads/2025/07/1-1.png"
  },
  {
    title: "Yogurts",
    subtitle: "Our Yogurt is your canvas",
    img: "https://frochi.ae/wp-content/uploads/2025/07/6-1.png"
  },
  {
    title: "Yogurts",
    subtitle: "Our Yogurt is your canvas",
    img: "https://frochi.ae/wp-content/uploads/2025/07/7-1.png"
  },
  {
    title: "Yogurts",
    subtitle: "Our Yogurt is your canvas",
    img: "https://frochi.ae/wp-content/uploads/2025/07/2-1.png"
  }
];

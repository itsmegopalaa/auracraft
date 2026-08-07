export type Notebook = {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  rating?: number;
  paper?: string;
  size?: string;
  quantity?: number;
};

export const notebooks = [
  {
    id: 1,
    name: "🌸 Sakura Anime",
    image: "/images/notebooks/sakura-anime.png",
    price: 299,
    category: "Anime",
    rating: 4.9,
   bestseller: true,
featured: true,
newArrival: true,
description: "A premium anime-inspired notebook with a beautiful Sakura design, smooth pages, and a creative feel for students, artists, and anime lovers.",
pages: 200,
paper: "Premium 80 GSM",
size: "A4",
  },
  {
    id: 2,
    name: "☠️ Shadow Swordsman",
    image: "/images/notebooks/shadow-swordsman.png",
    price: 349,
    category: "Fantasy",
    rating: 4.8,
    bestseller: false,
featured: true,
newArrival: true,
description: "A bold fantasy notebook inspired by shadow warriors and swordsmen. Designed for dreamers, gamers, and creators who love dark premium aesthetics.",
pages: 200,
paper: "Premium 80 GSM",
size: "A4",
  },
  {
    id: 3,
    name: "🌌 Galaxy Hero",
    image: "/images/notebooks/galaxy-hero.png",
    price: 399,
    category: "Superhero",
    rating: 5.0,
    bestseller: true,
featured: true,
newArrival: false,
description: "A futuristic galaxy-themed notebook with a heroic design. Perfect for imagination, ideas, school notes, and anyone who loves cosmic adventures.",
pages: 200,
paper: "Premium 80 GSM",
size: "A4",
  },
  {
  id: 4,
  name: "🏔️ Mountain",
  image: "/images/notebooks/mountain.png",
  price: 299 ,
  category: "Nature",
  rating: 4.7,
  bestseller: false,
  featured: false,
  newArrival: false,
  description: "A nature-inspired mountain notebook with a calm premium look. Perfect for journaling, study notes, planning, and everyday creativity.",
pages: 200,
paper: "Premium 80 GSM",
size: "A4",
  },
];
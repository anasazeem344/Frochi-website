export interface Flavor {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  bgLightHex: string;
  bgDarkHex: string;
  cupImg: string;
  fruits: {
    name: string;
    img: string;
  }[];
  accentHex: string;
  nutritionalInfo: {
    probiotics: string;
    calories: number;
    protein: string;
    fiber: string;
  };
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  img: string;
  color: string;
}

export interface GalleryItem {
  title: string;
  subtitle: string;
  img: string;
}

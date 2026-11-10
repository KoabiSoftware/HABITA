export type Option = { id: string; name: string };
export type Property = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  operation: "SALE" | "RENT";
  status: string;
  featured: boolean;
  amenities: string[];
  address: string;
  categoryId: string;
  locationId: string;
  category: Option;
  location: Option & { city: string };
  media: {
    id: string;
    url: string;
    alt: string;
    kind: string;
    position: number;
  }[];
};
export type User = { id: string; name: string; email: string; role: string };

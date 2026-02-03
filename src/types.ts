
export interface PriceEntry {
  price: number;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  originalPrice: number;
  currentPrice: number;
  image: string;
  category?: string;
  expiryDate?: string;
  isNew?: boolean;
  priceHistory?: PriceEntry[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ProductFormState {
  name: string;
  description: string;
  originalPrice: string;
  currentPrice: string;
  image: string;
  category: string;
  expiryDate: string;
  isNew: boolean;
  isLimitedTime: boolean;
}

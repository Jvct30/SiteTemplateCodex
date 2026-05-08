export interface UserResponse {
  id: number;
  full_name: string;
  username: string;
  cpf: string;
  birth_date: string;
  address_street: string;
  address_number: string;
  address_complement: string | null;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CartItemResponse {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image_url: string | null;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: number;
  items: CartItemResponse[];
  total: number;
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderResponse {
  id: number;
  user_id: number;
  status: string;
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  discount: number;
  total: number;
  payment_link: string | null;
  created_at: string;
  items: OrderItemResponse[];
}

export interface CouponResponse {
  id: number;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
}

export interface MessageResponse {
  id: number;
  content: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomRequestMessageResponse {
  id: number;
  request_id: number;
  sender_role: string;
  content: string;
  created_at: string;
}

export interface CustomRequestResponse {
  id: number;
  user_id: number;
  subject: string;
  status: string;
  created_at: string;
}

export interface CustomRequestDetailResponse {
  id: number;
  user_id: number;
  subject: string;
  status: string;
  created_at: string;
  messages: CustomRequestMessageResponse[];
}

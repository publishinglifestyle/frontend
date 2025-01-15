export interface Subscription {
  id: string;
  name: string;
  price_id: string;
  price: number;
  type: string;
  credits: number;
}

export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

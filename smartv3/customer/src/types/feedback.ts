export interface FeedbackItem {
  id: number;
  order_id: number;
  customer_id: number;
  overall_rating: number;
  food_quality: number;
  service_quality: number;
  value_for_money: number;
  ambiance: number;
  delivery_time?: number;
  comment: string;
  would_recommend: boolean;
  favorite_items: string[];
  improvement_suggestions: string;
  visit_again: boolean;
  created_at: string;
  status: 'pending' | 'submitted' | 'responded';
  response?: {
    message: string;
    responded_by: string;
    responded_at: string;
  };
}

export interface FeedbackFormData {
  overall_rating: number;
  food_quality: number;
  service_quality: number;
  value_for_money: number;
  ambiance: number;
  delivery_time?: number;
  comment: string;
  would_recommend: boolean;
  favorite_items: string[];
  improvement_suggestions: string;
  visit_again: boolean;
}

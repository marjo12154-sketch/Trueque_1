export type BookCondition = 'Excelente' | 'Bueno' | 'Aceptable';

export interface BookItem {
  id: string;
  title: string;
  subject: string;
  year?: string;
  condition: BookCondition;
  photoUrl: string;
  notes?: string;
  contactName?: string;
  isDelivered: boolean;
  createdAt: number;
  deliveredAt?: number;
}

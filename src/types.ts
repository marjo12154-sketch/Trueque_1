export type BookCondition = 'Excelente' | 'Bueno' | 'Aceptable';

export interface EvaluacionIA {
  nivelEstimado: string;
  materiaDetectada: string;
  vidaUtilCiclos: number;
  indiceAprovechamiento: number;
  etiquetasCompatibilidad: string[];
  consejoCuidado: string;
  origen?: 'gemini_api' | 'regla_manual_contingencia';
}

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
  evaluacionIA?: EvaluacionIA;
}

// src/features/techCard/types.ts
export interface TechCard {
  id: number;
  productName: string;
  customer: string;
  order: string;
  partNumber?: string;
  quantity: number;
  totalProducedQuantity: number;
  status: 'draft' | 'active' | 'archived';
  pdfUrl?: string;
  priority: number;        // ← добавить недостающие поля
  createdAt: string;       // ← добавить
  updatedAt: string;       // ← добавить
}

export interface TechCardListProps {
  techCards: TechCard[];
  onView: (card: TechCard) => void;
  onEdit?: (card: TechCard) => void;
  onDelete?: (card: TechCard) => void;
  onStatusChange?: (card: TechCard, newStatus: 'draft' | 'active' | 'archived') => Promise<void>;
}

export interface TechCardFormProps {
  techCard?: TechCard;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface TechCardViewerProps {
  techCard: TechCard;
  onClose: () => void;
  onEdit?: () => void;
}

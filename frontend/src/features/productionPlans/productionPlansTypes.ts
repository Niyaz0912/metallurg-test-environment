// src/features/productionPlans/productionPlansTypes.ts
export interface ProductionPlan {
  id: number;
  orderName: string;
  customerName: string;
  quantity: number;
  deadline: string;
  progressPercent: number;
}

export interface CreateProductionPlanData {
  orderName: string;
  customerName: string;
  quantity: number;
  deadline: string;
}


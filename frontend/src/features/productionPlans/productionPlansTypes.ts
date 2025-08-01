// src/features/productionPlans/productionPlansTypes.ts

export interface ProductionPlan {
  id: number;
  orderName: string;
  customerName: string;
  quantity: number;
  deadline: string; // ISO дата в строке
  progressPercent: number;
}

export type Trip = {
  id: string;
  userId: string;
  title: string;
  destinations: string[];
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  numberOfDays: number;
  totalBudget: number;
  isPrivate: boolean;
  createdAt: string;   
};


import { CostBreakdown, MonthlyCostTrend } from '@/types';

export const mockCostBreakdown: CostBreakdown[] = [
  { id: '1', accountId: '123456789012', accountName: 'Prod-Core', region: 'us-east-1', instanceCount: 142, idleInstanceCount: 18, totalMonthlyCost: 38400, idleMonthlyCost: 4320, potentialSavings: 3888, savingsPercentage: 10.1 },
  { id: '2', accountId: '123456789012', accountName: 'Prod-Core', region: 'eu-west-1', instanceCount: 98, idleInstanceCount: 12, totalMonthlyCost: 28600, idleMonthlyCost: 3500, potentialSavings: 3150, savingsPercentage: 11.0 },
  { id: '3', accountId: '234567890123', accountName: 'Staging-Platform', region: 'us-west-2', instanceCount: 74, idleInstanceCount: 38, totalMonthlyCost: 12200, idleMonthlyCost: 6100, potentialSavings: 5490, savingsPercentage: 45.0 },
  { id: '4', accountId: '234567890123', accountName: 'Staging-Platform', region: 'ap-southeast-1', instanceCount: 54, idleInstanceCount: 24, totalMonthlyCost: 7200, idleMonthlyCost: 2630, potentialSavings: 2367, savingsPercentage: 32.9 },
  { id: '5', accountId: '345678901234', accountName: 'Dev-Team-Alpha', region: 'eu-central-1', instanceCount: 89, idleInstanceCount: 51, totalMonthlyCost: 7200, idleMonthlyCost: 4100, potentialSavings: 3690, savingsPercentage: 51.3 },
  { id: '6', accountId: '456789012345', accountName: 'Analytics-Cluster', region: 'us-east-1', instanceCount: 88, idleInstanceCount: 13, totalMonthlyCost: 31400, idleMonthlyCost: 3500, potentialSavings: 3150, savingsPercentage: 10.0 },
  { id: '7', accountId: '456789012345', accountName: 'Analytics-Cluster', region: 'us-west-2', instanceCount: 68, idleInstanceCount: 10, totalMonthlyCost: 21200, idleMonthlyCost: 2340, potentialSavings: 2106, savingsPercentage: 9.9 },
  { id: '8', accountId: '567890123456', accountName: 'ML-Training', region: 'us-east-1', instanceCount: 74, idleInstanceCount: 18, totalMonthlyCost: 38900, idleMonthlyCost: 9200, potentialSavings: 8280, savingsPercentage: 21.3 },
];

export const mockCostTrend: MonthlyCostTrend[] = [
  { month: 'Oct 2024', totalCost: 178200, idleCost: 48300, savedCost: 0 },
  { month: 'Nov 2024', totalCost: 182400, idleCost: 51200, savedCost: 3100 },
  { month: 'Dec 2024', totalCost: 176800, idleCost: 44600, savedCost: 8400 },
  { month: 'Jan 2025', totalCost: 191200, idleCost: 52800, savedCost: 6200 },
  { month: 'Feb 2025', totalCost: 185600, idleCost: 47100, savedCost: 12300 },
  { month: 'Mar 2025', totalCost: 202400, idleCost: 35150, savedCost: 18700 },
];

export const totalPotentialSavings = mockCostBreakdown.reduce((sum, c) => sum + c.potentialSavings, 0);
export const totalMonthlyCost = mockCostBreakdown.reduce((sum, c) => sum + c.totalMonthlyCost, 0);

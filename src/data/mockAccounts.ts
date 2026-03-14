import { AWSAccount } from '@/types';

export const mockAccounts: AWSAccount[] = [
  { id: '1', accountId: '123456789012', name: 'Prod-Core', environment: 'production', totalInstances: 342, idleInstances: 47, monthlyCost: 84200, wasteCost: 11280 },
  { id: '2', accountId: '234567890123', name: 'Staging-Platform', environment: 'staging', totalInstances: 128, idleInstances: 62, monthlyCost: 19400, wasteCost: 8730 },
  { id: '3', accountId: '345678901234', name: 'Dev-Team-Alpha', environment: 'development', totalInstances: 89, idleInstances: 51, monthlyCost: 7200, wasteCost: 4100 },
  { id: '4', accountId: '456789012345', name: 'Analytics-Cluster', environment: 'production', totalInstances: 156, idleInstances: 23, monthlyCost: 52600, wasteCost: 5840 },
  { id: '5', accountId: '567890123456', name: 'ML-Training', environment: 'production', totalInstances: 74, idleInstances: 18, monthlyCost: 38900, wasteCost: 9200 },
];


## Full Analysis Complete

### EC2 Bias Inventory (every hardcoded assumption to remove/replace):

**Types (src/types/index.ts):**
- `EC2Instance` — 20+ EC2-specific fields (instanceId, instanceType, cpuAvg, cpuMax, networkInAvg, networkOutAvg, diskReadAvg, diskWriteAvg, os, state, idleScore)
- `InstanceStatus` — EC2 states (idle/active/stopped/terminated)
- `InstanceMetrics` — hardcoded to cpu/networkIn/networkOut/diskRead/diskWrite
- `KpiMetrics.totalInstances`, `idleInstances` — EC2 counts
- `AWSAccount.totalInstances`, `idleInstances` — EC2-bound fields
- `Recommendation.instanceId`, `instanceName`, `instanceType` — EC2-specific
- `RecommendationType` — `rightsize` is EC2-only concept (instance types)
- `CostBreakdown.instanceCount`, `idleInstanceCount` — EC2 counts

**Pages:**
- `Instances.tsx` — title "Idle Instance Explorer", `idleScore >= 90`, "Idle EC2 instances"
- `Metrics.tsx` — subtitle "CloudWatch telemetry for selected EC2 instance", metric names cpu/networkIn/diskRead
- `Scans.tsx` — description "Schedule and monitor idle instance detection jobs"
- `Index.tsx` — "Real-time AWS idle instance detection"
- `Recommendations.tsx` — `instanceType`, `targetInstanceType` in table

**Components:**
- `InstanceTable.tsx` — idleScore, cpuAvg, sparklines, instanceType — all EC2
- `UtilizationSparkline.tsx` — CPU sparkline
- `RegionBarChart.tsx` — "Idle Instances by Region", filters `idleScore > 65`
- `InstanceTypePieChart.tsx` — "Idle by Instance Family", `inst.instanceType.split('.')[0]`
- `ScanActivityFeed.tsx` — `idleFound` EC2 count
- `TopBar.tsx` — "CloudWatch telemetry visualization" description
- `NewScanDialog.tsx` — hardcoded ACCOUNTS array (5 EC2 accounts), no service type selection
- `ScanTable.tsx` — columns "Instances", "Idle Found" — EC2-bound

**Mock Data:**
- `mockInstances.ts` — 120 EC2 instances, `idleScore`, CPU/Network/Disk metrics
- `mockMetrics.ts` — `InstanceMetrics` with cpu/networkIn/networkOut/diskRead/diskWrite
- `mockRecommendations.ts` — all use `instanceId`, `instanceType`, `targetInstanceType`
- `mockCosts.ts` — `instanceCount`, `idleInstanceCount`

---

## Plan

### What we build

Transform the app into a **generic Cloud Resource platform**. The core architectural changes are:

1. **New types** — `CloudResource`, `ServicePlugin`, `ResourceMetric`, `GenericScan`, `GenericRecommendation` replace all EC2-specific types while keeping backward compat shims
2. **New mock data** — generic resources across 6 service types (EC2, S3, RDS, Lambda, DynamoDB, EKS) with generic `metadata` JSON
3. **Two new pages** — `/services` (Service Plugin Registry) and `/accounts` (AWS Account Manager)
4. **Updated pages** — rename/retheme all EC2 references to generic "Resources"
5. **New components** — `ServiceRegistry`, `ServiceCard`, `ResourceTable`, `AccountTable`, `AddAccountDialog`
6. **Updated charts** — RegionBarChart becomes generic (resources by region/service), InstanceTypePieChart becomes "Resources by Service"
7. **Updated Sidebar** — add Services + Accounts nav items
8. **Updated TopBar** — dynamic page titles for new routes, generic language
9. **Updated NewScanDialog** — add "Service Types" multi-select (EC2, RDS, S3, Lambda...)
10. **Scan capability model** — each scan targets `resourceTypes[]`, not just "instances"

### Files to create (new):
- `src/types/cloud-resource.ts` — all new generic types
- `src/data/mockCloudResources.ts` — 120 generic resources across 6 services
- `src/data/mockServicePlugins.ts` — 8 service plugin definitions with capabilities
- `src/data/mockResourceMetrics.ts` — generic metric time-series keyed by metric_name
- `src/pages/Services.tsx` — plugin registry page
- `src/pages/Accounts.tsx` — account management page
- `src/components/Services/ServiceRegistry.tsx` — grid of ServiceCard components
- `src/components/Services/ServiceCard.tsx` — individual plugin card with lifecycle controls
- `src/components/Accounts/AccountTable.tsx` — AWS accounts table
- `src/components/Accounts/AddAccountDialog.tsx` — add account dialog
- `src/components/Resources/ResourceTable.tsx` — generic resource explorer (replaces InstanceTable)

### Files to modify:
- `src/types/index.ts` — add generic types + backward compat, deprecate EC2Instance
- `src/App.tsx` — add `/services` and `/accounts` routes
- `src/components/Layout/Sidebar.tsx` — add Services + Accounts nav items
- `src/components/Layout/TopBar.tsx` — add page titles for new routes, generic copy
- `src/pages/Index.tsx` — replace EC2 KPIs with generic resource KPIs, update chart titles
- `src/pages/Instances.tsx` — rename to generic "Resource Explorer", use ResourceTable
- `src/pages/Metrics.tsx` — generic resource metrics, selectable metric dimensions
- `src/pages/Scans.tsx` — update copy, add service type to scan dialog
- `src/pages/Recommendations.tsx` — rename instanceName → resourceName, remove instanceType
- `src/components/Charts/RegionBarChart.tsx` — generic (resources by region)
- `src/components/Charts/InstanceTypePieChart.tsx` — rename to ResourceServicePieChart (resources by service type)
- `src/components/Scans/NewScanDialog.tsx` — add service type multi-select, remove hardcoded ACCOUNTS
- `src/components/Scans/ScanTable.tsx` — rename "Instances" → "Resources", "Idle Found" → "Flagged"
- `src/components/Recommendations/RecommendationTable.tsx` — generic resource references
- `src/components/Dashboard/ScanActivityFeed.tsx` — generic "idle found" language
- `src/data/mockInstances.ts` — keep for backward compat but extend with resource_type field
- `src/data/mockRecommendations.ts` — generalize to resource-based recommendations

### Key new types (src/types/cloud-resource.ts):

```typescript
// Universal resource abstraction
export interface CloudResource {
  id: string;
  resourceId: string;          // AWS resource ARN or ID
  resourceType: string;        // 'ec2:instance', 'rds:cluster', 's3:bucket', 'lambda:function'
  serviceName: AWSServiceName; // 'ec2' | 'rds' | 's3' | 'lambda' | 'dynamodb' | 'eks'
  displayName: string;
  accountId: string;
  accountName: string;
  region: Region;
  state: ResourceState;        // 'active' | 'idle' | 'stopped' | 'terminated' | 'unknown'
  idleScore: number;           // 0-100 normalized across ALL services
  monthlyCost: number;
  potentialSavings: number;
  metadata: Record<string, unknown>; // service-specific data (instanceType, bucketSize, etc.)
  tags: Record<string, string>;
  lastScannedAt: string;
  flagged: boolean;
  ignored: boolean;
}

// Service plugin definition
export interface ServicePlugin {
  id: string;
  serviceName: AWSServiceName;
  displayName: string;
  description: string;
  icon: string;
  enabled: boolean;
  capabilities: ServiceCapability[];
  resourceTypes: string[];    // ['ec2:instance', 'ec2:spot']
  accountIds: string[];
  lastScanAt?: string;
  resourceCount: number;
  flaggedCount: number;
  version: string;
  config: Record<string, unknown>;
}

export type ServiceCapability = 
  | 'discover_resources' 
  | 'scan_resources' 
  | 'collect_metrics' 
  | 'generate_recommendations' 
  | 'perform_actions';

export type AWSServiceName = 'ec2' | 'rds' | 's3' | 'lambda' | 'dynamodb' | 'eks' | 'iam' | 'elasticache';

// Generic resource metric (replaces InstanceMetrics)
export interface ResourceMetric {
  resourceId: string;
  resourceName: string;
  serviceName: AWSServiceName;
  region: Region;
  timeWindow: '7d' | '14d' | '30d';
  metrics: Record<string, MetricDataPoint[]>; // key = metric_name (cpu, connections, requests, etc.)
  availableMetrics: MetricDefinition[];
}

export interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
  color: string;
}

// Generic scan (replaces ScanJob with resource_type awareness)
export interface GenericScanJob {
  id: string;
  jobId: string;
  accountId: string;
  accountName: string;
  regions: Region[];
  serviceTypes: AWSServiceName[];  // NEW - which services to scan
  status: ScanStatus;
  progress: number;
  stage: ScanStage;
  startTime: string;
  endTime?: string;
  resourcesScanned: number;        // renamed from instancesScanned
  flaggedFound: number;            // renamed from idleFound
  errorMessage?: string;
  timeWindowDays: 7 | 14 | 30;
  triggeredBy: string;
}

export type ScanStage = 'discovery' | 'metrics_ingestion' | 'analysis' | 'recommendations' | 'complete';

// Generic recommendation (replaces Recommendation)
export interface GenericRecommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  serviceName: AWSServiceName;
  accountName: string;
  region: Region;
  metadata: Record<string, string>; // replaces instanceType, targetInstanceType
  type: RecommendationType;
  priority: Priority;
  confidence: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  reasoning: string;
  suggestedAction: string;
  status: 'pending' | 'approved' | 'dismissed' | 'executed';
  createdAt: string;
}
```

### Service Plugin Registry page design:
- Grid of cards, one per registered service plugin
- Each card: service icon, name, enabled/disabled toggle, resource count, flagged count, last scan time, capabilities badges, "Scan Now" button
- Services: EC2, RDS, S3, Lambda, DynamoDB, EKS, IAM, ElastiCache
- "Add Service Plugin" button opens config dialog

### Accounts page design:
- Table: Account ID, Name, Environment badge, Role ARN (masked), Connection Status, Last Validated, Actions
- "Add Account" dialog: name, account ID, environment, role ARN, external ID fields
- "Test Connection" button per row

### Resource Explorer (replaces Instances page):
- Adds "Service" column filter dropdown (EC2, RDS, S3...)
- Replaces "Instance Type" with "Resource Type" from metadata
- Keeps idle score, cost, sparkline columns
- Generic action buttons: "Flag for Review", "Ignore"

### ETL Pipeline Stages in ScanTable drill-down:
Show 4 stages as a progress stepper: Discovery → Metrics Ingestion → Analysis → Recommendations

---

## Implementation order:
1. Create `src/types/cloud-resource.ts` with all generic types
2. Create `src/data/mockServicePlugins.ts` (8 service plugins with capabilities/metadata)
3. Create `src/data/mockCloudResources.ts` (120 resources across EC2/RDS/S3/Lambda/DynamoDB/EKS)
4. Create `src/data/mockResourceMetrics.ts` (generic metrics with per-service dimensions)
5. Create `src/components/Services/ServiceCard.tsx`
6. Create `src/components/Services/ServiceRegistry.tsx`
7. Create `src/components/Accounts/AccountTable.tsx`
8. Create `src/components/Accounts/AddAccountDialog.tsx`
9. Create `src/components/Resources/ResourceTable.tsx` (generic, replaces InstanceTable)
10. Update `src/components/Charts/RegionBarChart.tsx` → generic cloud resources
11. Update `src/components/Charts/InstanceTypePieChart.tsx` → rename + use serviceName
12. Update `src/components/Scans/NewScanDialog.tsx` → add service type multi-select
13. Update `src/components/Scans/ScanTable.tsx` → generic columns + ETL stage stepper
14. Update `src/components/Recommendations/RecommendationTable.tsx` → generic resource refs
15. Update `src/components/Dashboard/ScanActivityFeed.tsx` → generic language
16. Create `src/pages/Services.tsx`
17. Create `src/pages/Accounts.tsx`
18. Update `src/pages/Index.tsx` → generic KPIs, add service breakdown widget
19. Update `src/pages/Instances.tsx` → generic Resource Explorer using ResourceTable
20. Update `src/pages/Metrics.tsx` → generic resource metrics with per-service metric dimensions
21. Update `src/pages/Scans.tsx` → generic copy
22. Update `src/pages/Recommendations.tsx` → generic resource references
23. Update `src/components/Layout/Sidebar.tsx` → add Services + Accounts nav
24. Update `src/components/Layout/TopBar.tsx` → new page titles
25. Update `src/App.tsx` → add /services + /accounts routes

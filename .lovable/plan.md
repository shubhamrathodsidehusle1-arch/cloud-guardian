
## Full Plan: Supabase Backend + ETL + Settings Page

### What exists today
- Pure frontend React app with all data hardcoded in `src/data/mock*.ts` files
- 8 pages, all importing from mock data, zero backend
- No Supabase, no auth, no persistence
- Mock EC2-biased recommendations still using `instanceName`, `instanceType`, `targetInstanceType`

### What we need to build

**1. Supabase Database Schema (migrations)**
Tables matching the service-agnostic architecture:
- `aws_accounts` — managed AWS accounts (accountId, name, environment, roleArn, externalId, regions[], enabled, connectionStatus, lastValidatedAt, totalResources, flaggedResources, monthlyCost, wasteCost)
- `service_plugins` — plugin registry (serviceName, displayName, description, icon, enabled, capabilities[], resourceTypes[], config jsonb, lastScanAt, resourceCount, flaggedCount, version, color)
- `cloud_resources` — universal resource table (resourceId, resourceType, serviceName, displayName, accountId, region, state, idleScore, monthlyCost, potentialSavings, metadata jsonb, tags jsonb, lastScannedAt, flagged, ignored)
- `scan_jobs` — generic ETL scan jobs (jobId, accountId, regions[], serviceTypes[], status, progress, stage, startTime, endTime, resourcesScanned, flaggedFound, errorMessage, timeWindowDays, triggeredBy)
- `resource_metrics` — time-series data (resourceId, metricName, timestamp, value)
- `recommendations` — service-agnostic (resourceId, resourceName, resourceType, serviceName, accountName, region, metadata jsonb, type, priority, confidence, estimatedMonthlySavings, estimatedAnnualSavings, reasoning, suggestedAction, status, createdAt)
- `cost_snapshots` — monthly cost history per account/region
- `app_settings` — key-value settings store (key, value jsonb, updatedAt)

All tables: RLS enabled, `authenticated` read access, no auth required initially (open read/write for demo).

**2. Supabase Edge Functions (ETL layer)**

`etl-scan-runner` — The core ETL orchestrator:
- POST `/etl-scan-runner` with `{ accountId, regions, serviceTypes, timeWindowDays }`
- Creates a `scan_jobs` record, updates stage as it progresses
- For each serviceType in the request, calls the appropriate "plugin handler" (internal switch)
- Each plugin handler uses AWS SDK (via Role ARN + STS AssumeRole simulation — since we can't actually call AWS without real credentials, it generates realistic data based on account/region/service config)
- Discovery stage → upsert cloud_resources
- Metrics ingestion stage → upsert resource_metrics
- Analysis stage → compute idleScore per resource
- Recommendations stage → generate and upsert recommendations
- Updates scan_jobs progress/stage/status throughout

`etl-test-connection` — validates an AWS account connection:
- POST with `{ roleArn, externalId, accountId }`
- Returns `{ status: 'connected' | 'error', message }`
- Updates the aws_accounts row status

**3. Data hooks layer (src/hooks/)**

Replace all `mock*` imports throughout the app with TanStack Query hooks:
- `useCloudResources()` → fetches from `cloud_resources` table
- `useScanJobs()` → fetches from `scan_jobs` table + Supabase Realtime subscription
- `useRecommendations()` → fetches from `recommendations` table
- `useCostSnapshots()` → fetches from `cost_snapshots` table
- `useAWSAccounts()` → fetches from `aws_accounts` table
- `useServicePlugins()` → fetches from `service_plugins` table
- `useResourceMetrics(resourceId)` → fetches from `resource_metrics` table
- `useAppSettings()` + `useUpdateSetting()` — reads/writes `app_settings` table

All hooks use `@supabase/supabase-js` client from `src/integrations/supabase/client.ts`

**4. Update every page to use hooks (remove all mock imports)**
- `Index.tsx` — useCloudResources, useScanJobs, useAWSAccounts, useServicePlugins
- `Resources.tsx` — useCloudResources
- `Scans.tsx` — useScanJobs (+ realtime), fire etl-scan-runner edge function on New Scan
- `Metrics.tsx` — useCloudResources (for resource selector), useResourceMetrics
- `CostAnalysis.tsx` — useCostSnapshots, useCloudResources
- `Recommendations.tsx` — useRecommendations, useMutateRecommendation
- `Services.tsx` — useServicePlugins, useMutateServicePlugin
- `Accounts.tsx` — useAWSAccounts, useMutateAWSAccount, invoke etl-test-connection
- `ScanActivityFeed.tsx` — useScanJobs
- `RecommendationTable.tsx` — useRecommendations + mutation
- `ScanTable.tsx` — useScanJobs + realtime
- `ServiceCard.tsx` — fire "Scan Now" via edge function
- `AccountTable.tsx` — useAWSAccounts + mutation, fire etl-test-connection

**5. Seed data via Supabase insert** 
After schema migrations, seed `aws_accounts`, `service_plugins`, `cloud_resources`, `scan_jobs`, `recommendations`, `cost_snapshots` with the same data currently in mock files — this makes the dashboard immediately populated with real DB data.

**6. New Settings Page (`/settings`)**
A comprehensive settings page with tabs:
- **General**: App name, organization name, default scan time window (7/14/30d), theme preference
- **AWS Config**: Default regions list (multi-select checkboxes), IAM external ID prefix, scan timeout (minutes)
- **Notifications**: Enable/disable scan completion alerts, failure alerts, recommendation threshold ($X savings minimum)
- **ETL Pipeline**: Max concurrent scans, retry attempts on failure, metrics retention days, resource TTL days
- **Data Management**: Purge old scan data button, export all data as JSON/CSV, reset to defaults
- **About**: Version, license, credits (Made by Ruben Hassid), documentation links

Settings are persisted to `app_settings` Supabase table via `useAppSettings` hook.

Add `/settings` route to App.tsx, add Settings nav item to Sidebar.tsx.

**7. Supabase Realtime for scan progress**
`useScanJobs` subscribes to `scan_jobs` table channel — any UPDATE to a running scan job triggers a React re-render, making progress bars and stage steppers update live without polling.

### Files to create
- `supabase/migrations/20240101000001_cloud_guardian_schema.sql` — full schema
- `supabase/functions/etl-scan-runner/index.ts` — ETL orchestrator edge function
- `supabase/functions/etl-test-connection/index.ts` — connection tester edge function
- `src/hooks/useCloudResources.ts`
- `src/hooks/useScanJobs.ts`
- `src/hooks/useRecommendations.ts`
- `src/hooks/useCostSnapshots.ts`
- `src/hooks/useAWSAccounts.ts`
- `src/hooks/useServicePlugins.ts`
- `src/hooks/useResourceMetrics.ts`
- `src/hooks/useAppSettings.ts`
- `src/pages/Settings.tsx`
- `src/integrations/supabase/types.ts` (updated to match new schema)

### Files to modify (remove mock imports, use hooks)
- `src/pages/Index.tsx`
- `src/pages/Resources.tsx`
- `src/pages/Scans.tsx`
- `src/pages/Metrics.tsx`
- `src/pages/CostAnalysis.tsx`
- `src/pages/Recommendations.tsx`
- `src/pages/Services.tsx`
- `src/pages/Accounts.tsx`
- `src/components/Dashboard/ScanActivityFeed.tsx`
- `src/components/Recommendations/RecommendationTable.tsx`
- `src/components/Scans/ScanTable.tsx`
- `src/components/Scans/NewScanDialog.tsx`
- `src/components/Services/ServiceCard.tsx`
- `src/components/Services/ServiceRegistry.tsx`
- `src/components/Accounts/AccountTable.tsx`
- `src/components/Resources/ResourceTable.tsx`
- `src/components/Charts/RegionBarChart.tsx`
- `src/components/Charts/InstanceTypePieChart.tsx`
- `src/components/Charts/CostTrendChart.tsx`
- `src/components/Dashboard/KpiCard.tsx`
- `src/components/Layout/Sidebar.tsx` — add Settings nav item
- `src/App.tsx` — add /settings route

### Mock data files
All `src/data/mock*.ts` files will be deleted once seed data is in Supabase. Until then they are superseded by the hooks returning Supabase data.

### Implementation order
1. Supabase migration (schema)
2. Supabase seed data (insert into all tables)
3. ETL edge functions (etl-scan-runner, etl-test-connection)
4. All data hooks
5. Update all pages + components to use hooks
6. Settings page + route
7. Sidebar + App.tsx updates
8. Real-time subscription in useScanJobs

### Key architecture decisions
- ETL edge function generates realistic resource data seeded from account/region parameters (simulated AWS discovery) since real AWS creds aren't available — structure is identical to what real AWS SDK calls would return
- Supabase Realtime used ONLY for scan_jobs (high-frequency updates during scans) — everything else is polled via TanStack Query's staleTime/refetchInterval
- Settings stored in app_settings as key-value pairs with jsonb values for flexibility
- All mock data files remain but become dead code once hooks return DB data — can be deleted in a follow-up

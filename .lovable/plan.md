
## Important Platform Clarification + Plan

**Lovable cannot run Python or Streamlit.** This platform exclusively builds React + TypeScript applications. There is no Python runtime, no pip, no Streamlit server.

However, I can build the **full functional equivalent** of the KiloClaw blueprint entirely in React/TypeScript — a dashboard that is visually and functionally identical to what Streamlit would produce, but as a proper production web app with all the same screens, charts, tables, and interactions described in the blueprint.

---

## What I Will Build: KiloClaw AWS Idle Instance Detection Dashboard

A complete, production-grade React dashboard implementing every section from the blueprint using:
- **React + TypeScript** (replaces Streamlit)
- **Recharts/Plotly-style charts** via recharts (already in package.json)
- **Realistic mock data** mirroring what the Python backend would return
- **TanStack Query** for data fetching simulation (replaces FastAPI client)
- **Shadcn/UI components** (replaces Streamlit widgets)
- **React Router** for multi-page navigation

---

## Pages & Features to Build

### 1. `/` — Overview Dashboard
- KPI cards: Total Instances Scanned, Idle Instances, Potential Monthly Savings, Active Scans
- Bar chart: Idle instances by region
- Pie chart: Instance type distribution
- Recent scan activity feed

### 2. `/scans` — Scan Management
- Start new scan (account, region, time window config)
- Scan job table with status (running/completed/failed), progress bars
- Scan detail drill-down

### 3. `/instances` — Idle Instance Explorer
- Filterable table: account, region, instance type, idle score, status
- Per-instance utilization sparklines (CPU, Network, Disk)
- Bulk action: Mark for termination / Ignore

### 4. `/metrics` — Metrics & Time-Series
- Plotly-style time-series charts via recharts for CPU, NetworkIn/Out, DiskRead/Write
- Configurable time windows (7d / 14d / 30d)
- Instance selector

### 5. `/cost-analysis` — FinOps Dashboard
- Monthly waste by account/region
- Cost breakdown table with savings potential
- Cumulative savings trend chart

### 6. `/recommendations` — Recommendations Engine
- Table of recommendations (terminate, rightsize, schedule)
- Priority + confidence score + estimated savings
- Export to CSV/JSON

### 7. Sidebar Navigation
- KiloClaw branding
- Dark DevOps theme (dark bg, green/cyan accents, terminal-inspired)
- Collapsible sidebar

---

## Directory Structure

```text
src/
  pages/
    Index.tsx          (Overview)
    Scans.tsx
    Instances.tsx
    Metrics.tsx
    CostAnalysis.tsx
    Recommendations.tsx
  components/
    Layout/
      Sidebar.tsx
      TopBar.tsx
    Dashboard/
      KpiCard.tsx
      ScanActivityFeed.tsx
    Charts/
      UtilizationChart.tsx
      CostTrendChart.tsx
      RegionBarChart.tsx
    Instances/
      InstanceTable.tsx
      UtilizationSparkline.tsx
    Scans/
      ScanTable.tsx
      NewScanDialog.tsx
    Recommendations/
      RecommendationTable.tsx
  data/
    mockInstances.ts
    mockScans.ts
    mockMetrics.ts
    mockCosts.ts
    mockRecommendations.ts
  types/
    index.ts           (AWSAccount, EC2Instance, ScanJob, Recommendation, etc.)
  hooks/
    useInstances.ts
    useScans.ts
    useMetrics.ts
    useCosts.ts
```

---

## Theme
Dark DevOps — slate-950 background, emerald/cyan accents, monospace fonts for metric values, consistent with Grafana/Datadog aesthetics.

## Files to Create/Modify
- `src/index.css` — dark theme variables
- `src/App.tsx` — add all routes + layout wrapper
- `src/types/index.ts` — all domain types from blueprint
- 5 data mock files
- 6 page files
- ~15 component files

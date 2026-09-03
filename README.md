MediFin Analytics
An interactive dashboard that puts hospital operations and financial
performance side by side — patient volume, readmissions, and length of
stay next to revenue, cost, claims, and payer mix — so you can see how
clinical outcomes and financial health actually connect.
Why combined, not separate
Most hospital dashboards split clinical and financial reporting into
different tools. MediFin Analytics deliberately puts them in one view so
questions like "is our busiest department also our most profitable one?"
or "does a high readmission rate line up with a specific payer mix?" can
be answered by looking at one screen instead of cross-referencing two.
Features
KPI row — total patients, total revenue, average 30-day readmission
rate, and pending receivables, all recalculated live as filters change
Patient volume & revenue trend — dual-axis line chart, toggle
between 6- and 12-month views
Insurance claims status — approved / pending / denied breakdown
Revenue vs. cost by department — grouped bar chart
Patient volume vs. profit margin — scatter plot exposing departments
that are high-volume but low-margin, or vice versa
Readmission rate & average length of stay — ranked list, flags
departments above a 12% readmission threshold
Revenue by payer — Medicare, Medicaid, private insurers, self-pay
Filters — department selector and time-range toggle apply across
every chart and KPI at once
Tech stack
React (single-component dashboard)
Recharts for all charts
lucide-react for icons
Tailwind utility classes for layout
Data
All data in this build is synthetic, generated with a seeded random
function so numbers stay consistent across reloads. It's structured to
mirror what a real hospital data warehouse would expose:
departmentData — per-department patients, revenue, cost, margin,
readmission rate, average length of stay
monthlyTrend — 12 months of patient volume, revenue, and cost
claimsData — claim status distribution
payerData — revenue and claim volume per insurance payer
No real patient or financial data is used anywhere in this project.
Running it
This is a self-contained React component (MediFinDashboard.jsx). To run
it standalone:
Bash
Swapping in real data
Replace the three synthetic data arrays (departmentData, monthlyTrend,
claimsData, payerData) with data fetched from your own API or CSV —
the shape each array expects is documented next to its definition in
MediFinDashboard.jsx. Everything downstream (KPIs, charts, filters)
recalculates automatically via useMemo.
Possible next steps
Hook up a FastAPI backend to serve real hospital data (same pattern as
the DataStory project — pandas for aggregation, one JSON endpoint per
section)
Add a date-range picker instead of the fixed 6/12-month toggle
Add a drill-down view per department

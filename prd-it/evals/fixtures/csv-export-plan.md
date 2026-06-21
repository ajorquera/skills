# CSV Export for Reports Page — Plan

*Drafted 2026-05-12*

## Goal

Let users on the Reports page download the currently filtered table as a CSV file, so they can take
the data into Excel without copy-pasting. This has been the top request in support tickets for two
months.

## What we're working with

- The Reports table is a React component (`ReportsTable.tsx`) backed by a `/api/reports` endpoint
  that already returns the full filtered dataset as JSON.
- Sushma owns the Reports surface and will review the PR.
- We want this out before the end of the quarter. No design review needed — it's a single button.
- We are deliberately not building XLSX or PDF export right now; CSV only.

## The plan

1. Add a "Download CSV" button to the Reports toolbar, next to the existing filter controls.
2. On click, take the data already loaded in the table (respecting current filters and sort) and
   serialize it to CSV client-side — no new endpoint needed.
3. Name the downloaded file with the report name and today's date, e.g. `sales-report-2026-05-12.csv`.
4. Handle the empty-state: if the filtered table has no rows, disable the button.
5. Send the PR to Sushma for review.

## Open questions

- Should the CSV include only the visible columns, or every column in the dataset even if hidden in
  the UI? Not yet decided.

## Definition of done

- A user can click "Download CSV" on the Reports page and get a CSV of the current filtered view.
- The file opens cleanly in Excel and Google Sheets with correct headers.
- The button is disabled when there are no rows.

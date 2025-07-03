# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript/React dashboard application that displays OpenAI API usage data. The project includes both a web dashboard for visualizing usage metrics and a Python script for fetching raw usage data.

## Usage Commands

### Running the Python Script
```bash
python3 notzero.py
```

The script requires an OpenAI API key to be configured at the top of the file in the `OPENAI_API_KEY` variable.

### Running the TypeScript Dashboard
```bash
npm install
npm run dev
```

The dashboard will be available at http://localhost:3000

### Other Commands
```bash
npm run build      # Build for production
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
```

## Code Architecture

### Python Script (`notzero.py`)
A utility script for fetching raw OpenAI usage data containing:

- **Configuration**: OpenAI API key setup at the top
- **Data Fetching**: `fetch_usage_for_date()` function that makes API calls to OpenAI's usage endpoint
- **Data Processing**: `summarise_by_model()` function that aggregates usage data by model/snapshot_id
- **Main Logic**: Iterates through the last 7 days and generates a JSON report

### TypeScript Dashboard (Main Application)
The main application is a web dashboard built with React, TypeScript, and Vite:

- **`src/types/usage.ts`**: TypeScript interfaces for usage data structures
- **`src/data/sampleData.ts`**: Sample data for testing the dashboard
- **`src/utils/dataProcessing.ts`**: Utility functions for data transformation and formatting
- **`src/components/`**: React components for metrics, charts, and UI elements
  - `Header.tsx`: Dashboard header with branding
  - `MetricCard.tsx`: Reusable metric display cards
  - `UsageChart.tsx`: Line charts for time-series data
  - `ModelBreakdown.tsx`: Bar and pie charts for model comparisons
- **`src/App.tsx`**: Main dashboard layout and data orchestration

The dashboard uses Recharts for visualizations, Tailwind CSS for styling, and Lucide React for icons.

## Important Notes

- The API key is currently hardcoded in the source file and should be replaced with the user's actual key
- The script uses the OpenAI usage API endpoint at `https://api.openai.com/v1/usage`
- Output is formatted as JSON for easy parsing and analysis
- Error handling is included for API failures on specific dates
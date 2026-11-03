## What it does
Merges PDFs entirely in your browser with `pdf-lib`. Files are never uploaded and no API key is needed.

Live Link : https://pdf-merger-viper.netlify.app/

## Run locally
1. `git clone https://github.com/vivekprabhu13/pdf-merger-app.git`
2. `cd pdf-merger-app && npm install`
3. `npm run dev`

## Privacy
All processing is client-side. Encrypted or unreadable PDFs are flagged and skipped.

## Testing
A manual test matrix (ingestion, validation, reordering, merging, download, dark mode) is in [section name]. Automating it with Playwright is a possible next step.

## Roadmap
AI features (for example summarizing merged documents) and Cloud Run deployment are ideas, not implemented.

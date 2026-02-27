# Specification

## Summary
**Goal:** Replace the plain-text "Download Bill" functionality with PDF generation using html2pdf.js.

**Planned changes:**
- Install or import html2pdf.js (via npm package or CDN compatible with React/Vite).
- Replace the existing plain-text `.txt` download logic in the "Download Bill" button handler in `App.tsx` with html2pdf.js-based PDF generation.
- Capture the bill content area (customer name, items table, subtotal, GST, grand total) and download it as `zweeti-bill.pdf`.
- Ensure the "Download Bill" button remains hidden during browser print.

**User-visible outcome:** Clicking "Download Bill" now downloads a properly formatted PDF file (`zweeti-bill.pdf`) containing the full bill details instead of a plain-text file.

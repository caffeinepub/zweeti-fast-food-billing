# Specification

## Summary
**Goal:** Update the visual theme of the Zweeti Pro Billing app to match a reference design and add a "Download Bill" button.

**Planned changes:**
- Set page background to grey (`#f2f2f2`) and center content in a white card (420px wide, rounded corners, box-shadow)
- Apply orange accent (`#ff5722`) to headings, table header backgrounds, and primary buttons
- Use dashed borders (`1px dashed #ccc`) for table rows
- Add a "Download Bill" button styled in blue (`#2196f3`) with white text, placed next to the existing "Print Bill" button
- Clicking "Download Bill" generates and downloads a file named `zweeti-bill.txt` containing customer name, items, subtotal, GST, and grand total
- Hide the "Download Bill" button during print

**User-visible outcome:** The billing app displays a polished orange-and-white themed layout, and users can download the current bill as a text file in addition to printing it.

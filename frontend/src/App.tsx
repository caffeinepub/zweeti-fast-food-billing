import { useState, useRef, useEffect } from 'react';
import BillingForm from './components/BillingForm';
import BillSummary from './components/BillSummary';
import { Printer, Download, UtensilsCrossed, Heart } from 'lucide-react';

export interface BillItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  total: number;
}

// Dynamically load html2pdf.js from CDN
function loadHtml2Pdf(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>)['html2pdf']) {
      resolve((window as unknown as Record<string, unknown>)['html2pdf']);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve((window as unknown as Record<string, unknown>)['html2pdf']);
    script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
    document.head.appendChild(script);
  });
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `ZWT-${yyyy}${mm}${dd}-${rand}`;
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function App() {
  const [customerName, setCustomerName] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [nextId, setNextId] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const billRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
    setBillDate(formatDate(new Date()));
  }, []);

  const handleAddItem = (name: string, price: number, qty: number) => {
    const total = price * qty;
    setBillItems(prev => [
      ...prev,
      { id: nextId, name, price, qty, total }
    ]);
    setNextId(n => n + 1);
  };

  const handleRemoveItem = (id: number) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearBill = () => {
    setBillItems([]);
    setCustomerName('');
    setNextId(1);
    setInvoiceNumber(generateInvoiceNumber());
    setBillDate(formatDate(new Date()));
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'unknown-app';

  const handleDownloadBill = async () => {
    setIsDownloading(true);
    try {
      const html2pdf = await loadHtml2Pdf() as (element: HTMLElement, opts: object) => { save: () => Promise<void> };

      // Build a self-contained HTML element for the PDF
      const container = document.createElement('div');
      container.style.cssText = `
        font-family: Arial, sans-serif;
        width: 400px;
        padding: 24px;
        background: #fff;
        color: #333;
      `;

      // Header
      const header = document.createElement('div');
      header.style.cssText = `
        background: #ff5722;
        color: #fff;
        text-align: center;
        padding: 16px;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0;
      `;
      header.innerHTML = `
        <div style="font-size:20px;font-weight:900;letter-spacing:1px;">🍔 ZWEETI FAST FOOD</div>
        <div style="font-size:12px;margin-top:4px;opacity:0.9;">Fast Food Billing Receipt</div>
      `;
      container.appendChild(header);

      // Invoice No & Date
      const invoiceInfoDiv = document.createElement('div');
      invoiceInfoDiv.style.cssText = `
        background: #fff8f6;
        padding: 10px 16px;
        font-size: 13px;
        color: #555;
        border-left: 3px solid #ff5722;
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
      `;
      invoiceInfoDiv.innerHTML = `
        <span><strong>Invoice No:</strong> ${invoiceNumber}</span>
        <span><strong>Date:</strong> ${billDate}</span>
      `;
      container.appendChild(invoiceInfoDiv);

      // Customer name
      if (customerName) {
        const custDiv = document.createElement('div');
        custDiv.style.cssText = `
          background: #fff3ef;
          padding: 10px 16px;
          font-size: 13px;
          color: #555;
          border-left: 3px solid #ff5722;
          margin-bottom: 12px;
        `;
        custDiv.innerHTML = `<strong>Customer:</strong> ${customerName}`;
        container.appendChild(custDiv);
      } else {
        invoiceInfoDiv.style.marginBottom = '12px';
      }

      // Items table
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        margin-bottom: 0;
      `;

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr style="background:#ff5722;color:#fff;">
          <th style="text-align:left;padding:8px 10px;">Item</th>
          <th style="text-align:center;padding:8px 6px;">Price</th>
          <th style="text-align:center;padding:8px 6px;">Qty</th>
          <th style="text-align:right;padding:8px 10px;">Total</th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      billItems.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.style.cssText = `
          border-bottom: 1px dashed #ccc;
          background: ${idx % 2 === 0 ? '#fff' : '#fafafa'};
        `;
        tr.innerHTML = `
          <td style="padding:8px 10px;font-weight:600;">${item.name}</td>
          <td style="padding:8px 6px;text-align:center;color:#666;">₹${item.price.toFixed(2)}</td>
          <td style="padding:8px 6px;text-align:center;">
            <span style="background:#ff5722;color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${item.qty}</span>
          </td>
          <td style="padding:8px 10px;text-align:right;font-weight:700;">₹${item.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.appendChild(table);

      // Totals section
      const totals = document.createElement('div');
      totals.style.cssText = `
        border-top: 2px dashed #ccc;
        padding: 12px 10px 4px;
        font-size: 13px;
      `;
      totals.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#666;">Subtotal</span>
          <span style="font-weight:600;color:#444;">₹${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="color:#666;">GST <span style="background:#eee;padding:1px 6px;border-radius:10px;font-size:11px;font-weight:700;">5%</span></span>
          <span style="font-weight:600;color:#444;">₹${gst.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border-top:2px dashed #ccc;padding-top:10px;">
          <span style="font-weight:800;font-size:15px;color:#222;">Grand Total</span>
          <span style="font-weight:900;font-size:18px;color:#ff5722;">₹${grandTotal.toFixed(2)}</span>
        </div>
      `;
      container.appendChild(totals);

      // Footer note
      const footerNote = document.createElement('div');
      footerNote.style.cssText = `
        text-align: center;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #eee;
        font-size: 11px;
        color: #999;
      `;
      footerNote.innerHTML = `
        <div>Thank you for visiting Zweeti Fast Food! 🍔</div>
        <div style="margin-top:3px;">GST @ 5% included in Grand Total</div>
      `;
      container.appendChild(footerNote);

      // Temporarily attach to DOM (off-screen) for html2pdf rendering
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const opts = {
        margin: [10, 10, 10, 10],
        filename: 'zweeti-bill.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
      };

      await html2pdf(container, opts).save();

      document.body.removeChild(container);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen zweeti-page-bg flex flex-col">
      {/* Header */}
      <header className="zweeti-header print:hidden">
        <div className="max-w-[460px] mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src="/assets/generated/zweeti-logo.dim_128x128.png"
            alt="Zweeti Logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
          />
          <div>
            <h1 className="text-white font-extrabold text-xl leading-tight tracking-tight">
              Zweeti Fast Food
            </h1>
            <p className="text-orange-100 text-xs font-medium">Quick Billing System</p>
          </div>
          <div className="ml-auto">
            <UtensilsCrossed className="text-orange-200 w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Print-only header */}
      <div className="hidden print:block text-center py-4 border-b-2 border-gray-300 mb-4">
        <h1 className="text-2xl font-extrabold text-gray-800">Zweeti Fast Food 🍔</h1>
        <p className="text-sm text-gray-500">Fast Food Billing Receipt</p>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4">
        <div className="zweeti-bill-box space-y-4">

          {/* Invoice Info */}
          <div className="zweeti-card invoice-info">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
              <p>
                <span className="font-bold text-gray-700">Invoice No:</span>{' '}
                <span className="font-mono text-[#ff5722] font-semibold">{invoiceNumber}</span>
              </p>
              <p>
                <span className="font-bold text-gray-700">Date:</span>{' '}
                <span className="font-medium">{billDate}</span>
              </p>
            </div>
          </div>

          {/* Customer Name */}
          <div className="zweeti-card">
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter customer name..."
              className="w-full px-4 py-2.5 rounded-[5px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 focus:border-[#ff5722] text-gray-800 font-medium placeholder:text-gray-400 text-sm transition-all print:border-none print:p-0 print:font-bold print:text-base"
            />
            {customerName && (
              <p className="mt-1.5 text-xs text-gray-400">
                Billing for: <span className="font-semibold zweeti-orange-text">{customerName}</span>
              </p>
            )}
          </div>

          {/* Billing Form */}
          <BillingForm onAddItem={handleAddItem} />

          {/* Bill Summary */}
          {billItems.length > 0 && (
            <div ref={billRef}>
              <BillSummary
                customerName={customerName}
                items={billItems}
                subtotal={subtotal}
                gst={gst}
                grandTotal={grandTotal}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden">
            {billItems.length > 0 && (
              <>
                <button
                  onClick={() => window.print()}
                  className="zweeti-btn-green flex-1 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
                <button
                  onClick={handleDownloadBill}
                  disabled={isDownloading}
                  className="zweeti-btn-blue no-print flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Bill
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearBill}
                  className="zweeti-btn-clear flex items-center justify-center gap-2"
                >
                  Clear All
                </button>
              </>
            )}
          </div>

          {/* Empty state */}
          {billItems.length === 0 && (
            <div className="zweeti-card p-8 text-center print:hidden">
              <div className="text-5xl mb-3">🍔</div>
              <p className="text-gray-500 font-medium text-sm">No items added yet.</p>
              <p className="text-gray-400 text-xs mt-1">Select an item and click "Add Item" to start billing.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center print:hidden">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          © {new Date().getFullYear()} Zweeti Fast Food. Built with{' '}
          <Heart className="w-3 h-3 fill-current" style={{ color: '#ff5722' }} />{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="zweeti-orange-text hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

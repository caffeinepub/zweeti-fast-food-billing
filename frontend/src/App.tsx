import { useState } from 'react';
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

export default function App() {
  const [customerName, setCustomerName] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [nextId, setNextId] = useState(1);

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
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'unknown-app';

  const handleDownloadBill = () => {
    const lines: string[] = [];
    lines.push('================================');
    lines.push('       ZWEETI FAST FOOD         ');
    lines.push('     Fast Food Billing Receipt  ');
    lines.push('================================');
    if (customerName) {
      lines.push(`Customer: ${customerName}`);
      lines.push('--------------------------------');
    }
    lines.push('');
    lines.push(`${'Item'.padEnd(20)} ${'Price'.padStart(6)} ${'Qty'.padStart(4)} ${'Total'.padStart(8)}`);
    lines.push('--------------------------------');
    billItems.forEach(item => {
      const namePart = item.name.padEnd(20);
      const pricePart = `₹${item.price.toFixed(2)}`.padStart(6);
      const qtyPart = String(item.qty).padStart(4);
      const totalPart = `₹${item.total.toFixed(2)}`.padStart(8);
      lines.push(`${namePart} ${pricePart} ${qtyPart} ${totalPart}`);
    });
    lines.push('--------------------------------');
    lines.push(`${'Subtotal:'.padEnd(30)} ₹${subtotal.toFixed(2)}`);
    lines.push(`${'GST (5%):'.padEnd(30)} ₹${gst.toFixed(2)}`);
    lines.push('================================');
    lines.push(`${'GRAND TOTAL:'.padEnd(30)} ₹${grandTotal.toFixed(2)}`);
    lines.push('================================');
    lines.push('');
    lines.push('Thank you for visiting Zweeti Fast Food!');
    lines.push('GST @ 5% included in Grand Total');

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zweeti-bill.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <BillSummary
              customerName={customerName}
              items={billItems}
              subtotal={subtotal}
              gst={gst}
              grandTotal={grandTotal}
              onRemoveItem={handleRemoveItem}
            />
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
                  className="zweeti-btn-blue no-print flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Bill
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

import { useState, useEffect } from 'react';
import BillingForm from './components/BillingForm';
import BillSummary from './components/BillSummary';
import { Printer, UtensilsCrossed, Heart, BarChart2, RefreshCw, CalendarSearch, LogOut } from 'lucide-react';

export interface BillItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  total: number;
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ZWT-${datePart}-${randomPart}`;
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Builds the localStorage key using non-zero-padded month and day
// Format: dailyTotal_YYYY-M-D  (matches reference script key format)
function getKeyFromDate(d: Date): string {
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // non-zero-padded
  const day = d.getDate();        // non-zero-padded
  return `dailyTotal_${year}-${month}-${day}`;
}

function getTodayKey(): string {
  return getKeyFromDate(new Date());
}

function loadDailyTotal(): number {
  const key = getTodayKey();
  const stored = localStorage.getItem(key);
  return stored ? parseFloat(stored) : 0;
}

function saveDailyTotal(total: number): void {
  const key = getTodayKey();
  localStorage.setItem(key, total.toString());
}

export default function App() {
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  // Billing state
  const [customerName, setCustomerName] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [nextId, setNextId] = useState(1);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [dailyTotal, setDailyTotal] = useState(0);
  const [applyGst, setApplyGst] = useState(true);

  // Date Wise Sales Report state
  const [selectedDate, setSelectedDate] = useState('');
  const [dateWiseTotal, setDateWiseTotal] = useState(0);
  const [dateWiseFormatted, setDateWiseFormatted] = useState('');

  // Auto-login: check localStorage on mount
  useEffect(() => {
    if (localStorage.getItem('zweetiUser')) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
    setBillDate(formatDate(new Date()));
    setDailyTotal(loadDailyTotal());
  }, []);

  const handleLogin = () => {
    const trimmed = mobileNumber.trim();
    if (trimmed.length !== 10) {
      alert('Enter valid 10 digit mobile number');
      return;
    }
    localStorage.setItem('zweetiUser', trimmed);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('zweetiUser');
    location.reload();
  };

  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

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

  // Adds the given amount to today's daily total in state and localStorage
  const addToDailyTotal = (amount: number) => {
    const newTotal = dailyTotal + amount;
    setDailyTotal(newTotal);
    saveDailyTotal(newTotal);
  };

  // Compute GST-aware totals (mirrors calculateBill reference logic)
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const gst = applyGst ? subtotal * 0.05 : 0;
  const grandTotal = subtotal + gst;

  const handleClearBill = () => {
    if (billItems.length > 0 && grandTotal > 0) {
      addToDailyTotal(grandTotal);
    }
    setBillItems([]);
    setCustomerName('');
    setNextId(1);
    setApplyGst(true);
    setInvoiceNumber(generateInvoiceNumber());
    setBillDate(formatDate(new Date()));
  };

  const clearDailyTotal = () => {
    setDailyTotal(0);
    // Remove the key so date-wise lookup returns 0 (not stored "0")
    localStorage.removeItem(getTodayKey());
  };

  const handleDateWiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // YYYY-MM-DD from input
    setSelectedDate(value);
    if (value) {
      // Parse the date string using new Date() to extract non-zero-padded parts
      const d = new Date(value);
      // Format as DD-MM-YYYY for display
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      setDateWiseFormatted(`${dd}-${mm}-${yyyy}`);
      // Build key using same format as Daily Sales Report: dailyTotal_YYYY-M-D (non-zero-padded)
      const key = getKeyFromDate(d);
      const stored = localStorage.getItem(key);
      setDateWiseTotal(stored ? parseFloat(stored) : 0);
    } else {
      setDateWiseFormatted('');
      setDateWiseTotal(0);
    }
  };

  const todayFormatted = formatDate(new Date());

  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'unknown-app';

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen zweeti-page-bg flex flex-col no-print">
        {/* Login Header */}
        <header className="zweeti-header">
          <div className="max-w-[460px] mx-auto px-4 py-3 flex items-center gap-3">
            <img
              src="/assets/generated/zweeti-logo.dim_128x128.png"
              alt="Zweeti Logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
            />
            <div>
              <h1 className="text-white font-extrabold text-xl leading-tight tracking-tight">
                ZWEETI Pro Login
              </h1>
              <p className="text-orange-100 text-xs font-medium">Quick Billing System</p>
            </div>
            <div className="ml-auto">
              <UtensilsCrossed className="text-orange-200 w-6 h-6" />
            </div>
          </div>
        </header>

        {/* Login Card */}
        <main className="flex-1 flex items-center justify-center py-10 px-4">
          <div className="zweeti-bill-box">
            <div className="zweeti-card">
              <h2 className="text-lg font-extrabold text-gray-800 mb-1">Welcome Back 👋</h2>
              <p className="text-sm text-gray-500 mb-5">Enter your mobile number to continue.</p>

              <input
                id="mobile"
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                onKeyDown={handleMobileKeyDown}
                placeholder="Enter Mobile Number"
                maxLength={10}
                style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                className="rounded-[5px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 focus:border-[#ff5722] text-gray-800 font-medium placeholder:text-gray-400 transition-all"
              />

              <button
                onClick={handleLogin}
                style={{ marginTop: '10px' }}
                className="zweeti-btn-orange w-full text-base"
              >
                Continue
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-4 text-center">
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

  // ── Main Billing App ──────────────────────────────────────────────────────
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
            <p className="text-sm text-gray-600">
              <b className="text-gray-700">Invoice:</b>{' '}
              <span id="invoiceNo" className="font-mono text-[#ff5722] font-semibold">{invoiceNumber}</span>
              <br />
              <b className="text-gray-700">Date:</b>{' '}
              <span id="billDate" className="font-medium">{billDate}</span>
            </p>
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
            <BillSummary
              customerName={customerName}
              items={billItems}
              applyGst={applyGst}
              onApplyGstChange={setApplyGst}
              onRemoveItem={handleRemoveItem}
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 no-print">
            {billItems.length > 0 && (
              <>
                <button
                  onClick={() => window.print()}
                  className="print zweeti-btn-green flex-1 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  🖨️ Print Bill
                </button>
                <button
                  onClick={() => window.print()}
                  className="pdf zweeti-btn-blue flex items-center justify-center gap-2"
                >
                  ⬇️ Download PDF
                </button>
                <button
                  onClick={handleClearBill}
                  className="zweeti-btn-orange flex items-center justify-center gap-2"
                >
                  Clear Bill
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

          {/* Daily Sales Report */}
          <div className="no-print zweeti-card border-l-4 border-[#ff5722]">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-5 h-5 text-[#ff5722]" />
              <h3 className="font-extrabold text-gray-800 text-base tracking-tight">
                📊 Daily Sales Report
              </h3>
            </div>
            <div className="space-y-1.5 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Date:</span>{' '}
                <span className="font-medium">{todayFormatted}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Today's Total:</span>{' '}
                <span className="font-extrabold text-[#ff5722] text-base">
                  ₹ {dailyTotal.toFixed(2)}
                </span>
              </p>
            </div>
            <button
              onClick={clearDailyTotal}
              className="flex items-center gap-2 px-4 py-2 rounded-[5px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors border border-gray-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              🔄 Clear Today
            </button>
          </div>

          {/* Date Wise Sales Report */}
          <div className="no-print date-report">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CalendarSearch className="w-5 h-5 text-[#ff5722]" />
              <h3>
                📅 Date Wise Sales Report
              </h3>
            </div>
            <div className="mb-3">
              <input
                type="date"
                id="selectDate"
                value={selectedDate}
                onChange={handleDateWiseChange}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Date:</span>{' '}
                <span id="selectedDate" className="font-medium">
                  {dateWiseFormatted || <span className="text-gray-400 italic">—</span>}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Total Sale:</span>{' '}
                <span className="font-semibold text-gray-700">₹</span>{' '}
                <span
                  id="dateTotal"
                  className="font-extrabold text-[#ff5722] text-base"
                >
                  {selectedDate ? dateWiseTotal.toFixed(2) : '0'}
                </span>
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="no-print">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 font-semibold text-sm transition-colors border border-gray-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

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

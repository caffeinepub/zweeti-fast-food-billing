import { useState, useEffect, useRef } from 'react';
import BillingForm from './components/BillingForm';
import BillSummary from './components/BillSummary';
import { Printer, UtensilsCrossed, Heart, BarChart2, RefreshCw, CalendarSearch, Loader2 } from 'lucide-react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from './firebase';
import type { ConfirmationResult } from './firebase';

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

function getKeyFromDate(d: Date): string {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
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

  // OTP flow state — pre-filled with test credentials
  const [phone, setPhone] = useState('+911234567890');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loginError, setLoginError] = useState('');
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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

  // Initialize invisible RecaptchaVerifier when login screen mounts
  useEffect(() => {
    if (!isLoggedIn && !otpSent) {
      const timer = setTimeout(() => {
        if (!recaptchaVerifierRef.current) {
          // Use invisible reCAPTCHA matching the Firebase CDN API:
          // new RecaptchaVerifier(containerId, { size: 'invisible' }, auth)
          const verifier = new RecaptchaVerifier('recaptcha', { size: 'invisible' }, auth);
          verifier.render();
          recaptchaVerifierRef.current = verifier;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, otpSent]);

  const sendOTP = async () => {
    setLoginError('');
    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length < 10) {
      setLoginError('Please enter a valid phone number (e.g. +91XXXXXXXXXX).');
      return;
    }
    setSendingOtp(true);
    try {
      if (!recaptchaVerifierRef.current) {
        // Create invisible RecaptchaVerifier: new RecaptchaVerifier(containerId, options, auth)
        recaptchaVerifierRef.current = new RecaptchaVerifier('recaptcha', { size: 'invisible' }, auth);
        await recaptchaVerifierRef.current.render();
      }
      const result = await signInWithPhoneNumber(auth, trimmedPhone, recaptchaVerifierRef.current);
      confirmationResultRef.current = result;
      setOtpSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      setLoginError(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOTP = async () => {
    setLoginError('');
    if (!confirmationResultRef.current) {
      setLoginError('Please request an OTP first.');
      return;
    }
    if (!otp.trim()) {
      setLoginError('Please enter the OTP.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const result = await confirmationResultRef.current.confirm(otp.trim());
      // Persist authentication to localStorage
      localStorage.setItem('zweetiUser', result.user.uid);
      setIsLoggedIn(true);
    } catch (_err: unknown) {
      setLoginError('Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zweetiUser');
    location.reload();
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

  const addToDailyTotal = (amount: number) => {
    const newTotal = dailyTotal + amount;
    setDailyTotal(newTotal);
    saveDailyTotal(newTotal);
  };

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
    localStorage.removeItem(getTodayKey());
  };

  const handleDateWiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedDate(value);
    if (value) {
      const d = new Date(value);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      setDateWiseFormatted(`${dd}-${mm}-${yyyy}`);
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
              <p className="text-sm text-gray-500 mb-5">
                {otpSent
                  ? 'Enter the OTP sent to your phone.'
                  : 'Enter your phone number to receive an OTP.'}
              </p>

              {/* Phone input */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  disabled={otpSent || sendingOtp}
                  style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                  className="rounded-[5px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 focus:border-[#ff5722] text-gray-800 font-medium placeholder:text-gray-400 transition-all disabled:opacity-60 disabled:bg-gray-50"
                />
              </div>

              {/* Invisible reCAPTCHA container — no visible widget rendered */}
              <div id="recaptcha" />

              {/* Send OTP button */}
              {!otpSent && (
                <button
                  onClick={sendOTP}
                  disabled={sendingOtp}
                  className="zweeti-btn-orange w-full text-base flex items-center justify-center gap-2 no-print mb-1"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending OTP…
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              )}

              {/* OTP input — shown after OTP is sent */}
              {otpSent && (
                <>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      One-Time Password
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter OTP"
                      maxLength={6}
                      disabled={verifyingOtp}
                      style={{ width: '100%', padding: '12px', fontSize: '20px', letterSpacing: '0.3em', textAlign: 'center' }}
                      className="rounded-[5px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 focus:border-[#ff5722] text-gray-800 font-bold placeholder:text-gray-400 placeholder:tracking-normal transition-all disabled:opacity-60"
                    />
                  </div>

                  {/* Verify button */}
                  <button
                    onClick={verifyOTP}
                    disabled={verifyingOtp}
                    className="zweeti-btn-orange w-full text-base flex items-center justify-center gap-2 no-print"
                    style={{ marginBottom: '8px' }}
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>

                  {/* Resend option */}
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('123456');
                      setLoginError('');
                      confirmationResultRef.current = null;
                      recaptchaVerifierRef.current = null;
                    }}
                    className="w-full text-sm text-gray-500 hover:text-[#ff5722] transition-colors font-medium py-1 no-print"
                  >
                    ← Change phone number / Resend OTP
                  </button>
                </>
              )}

              {/* Error message */}
              {loginError && (
                <div className="mt-3 px-3 py-2 rounded-[5px] bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {loginError}
                </div>
              )}
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
            <div className="zweeti-card text-center py-8">
              <p className="text-gray-400 text-sm">No items added yet. Use the form above to add items.</p>
            </div>
          )}

          {/* Daily Sales Report */}
          <div className="zweeti-card no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#ff5722]" />
                <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">
                  Today's Sales
                </h3>
              </div>
              <button
                onClick={clearDailyTotal}
                title="Reset today's total"
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-1">{todayFormatted}</p>
            <p className="text-2xl font-extrabold text-[#ff5722]">
              ₹{dailyTotal.toFixed(2)}
            </p>
          </div>

          {/* Date Wise Sales Report */}
          <div className="zweeti-card no-print date-report-section">
            <div className="flex items-center gap-2 mb-3">
              <CalendarSearch className="w-4 h-4 text-[#2196f3]" />
              <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">
                Date Wise Sales Report
              </h3>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateWiseChange}
              className="w-full px-3 py-2 rounded-[5px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2196f3]/30 focus:border-[#2196f3] text-gray-700 text-sm mb-3 transition-all"
            />
            {selectedDate && (
              <div className="bg-blue-50 rounded-[5px] px-4 py-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-0.5">{dateWiseFormatted}</p>
                <p className="text-xl font-extrabold text-[#2196f3]">
                  ₹{dateWiseTotal.toFixed(2)}
                </p>
                {dateWiseTotal === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No sales recorded for this date.</p>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center print:hidden">
        <div className="max-w-[460px] mx-auto flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors font-medium"
          >
            Logout
          </button>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Built with{' '}
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
        </div>
      </footer>
    </div>
  );
}

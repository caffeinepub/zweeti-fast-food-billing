import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { BillItem } from '../App';

interface BillSummaryProps {
  customerName: string;
  items: BillItem[];
  applyGst: boolean;
  onApplyGstChange: (value: boolean) => void;
  onRemoveItem: (id: number) => void;
}

const GST_RATE = 0.05;

export default function BillSummary({
  customerName,
  items,
  applyGst,
  onApplyGstChange,
  onRemoveItem,
}: BillSummaryProps) {
  const [subtotalDisplay, setSubtotalDisplay] = useState('0.00');
  const [gstDisplay, setGstDisplay] = useState('0.00');
  const [grandTotalDisplay, setGrandTotalDisplay] = useState('0.00');

  // Mirror the reference script's calculateBill() function:
  // fires on initial mount (window.onload equivalent) and whenever
  // items or applyGst changes (checkbox onChange equivalent).
  useEffect(() => {
    const subtotalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const gst = applyGst ? subtotalAmount * GST_RATE : 0;
    const grandTotal = subtotalAmount + gst;

    setSubtotalDisplay(subtotalAmount.toFixed(2));
    setGstDisplay(gst.toFixed(2));
    setGrandTotalDisplay(grandTotal.toFixed(2));
  }, [items, applyGst]);

  return (
    <div className="zweeti-card overflow-hidden !p-0">
      {/* Bill Header - orange background */}
      <div className="zweeti-table-header px-5 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-sm">Bill Summary</h2>
          {customerName && (
            <p className="text-orange-100 text-xs mt-0.5">Customer: {customerName}</p>
          )}
        </div>
        <span className="text-orange-100 text-xs font-medium">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Two-column table: Item | ₹ */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="zweeti-table-header">
              <th className="text-left px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wide">Item</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wide">₹</th>
              <th className="px-2 py-2.5 print:hidden w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="zweeti-table-row">
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {item.name}
                  {item.qty > 1 && (
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">×{item.qty}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">{item.total.toFixed(2)}</td>
                <td className="px-2 py-3 print:hidden">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total">
              <td className="px-4 py-3 font-extrabold text-gray-800 text-base border-t-2 border-dashed border-gray-300">Total</td>
              <td id="grandTotal" className="px-4 py-3 text-right font-extrabold zweeti-orange-text text-xl border-t-2 border-dashed border-gray-300">{grandTotalDisplay}</td>
              <td className="border-t-2 border-dashed border-gray-300 print:hidden"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Totals breakdown */}
      <div className="px-5 py-4 space-y-2 border-t border-dashed border-gray-200">
        {/* GST Toggle - hidden during print */}
        <div className="no-print flex items-center gap-2 pb-1">
          <input
            type="checkbox"
            id="gstToggle"
            checked={applyGst}
            onChange={e => onApplyGstChange(e.target.checked)}
            className="w-4 h-4 accent-[#ff5722] cursor-pointer"
          />
          <label
            htmlFor="gstToggle"
            className="text-sm font-medium text-gray-600 cursor-pointer select-none"
          >
            Apply GST (5%)
          </label>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Subtotal</span>
          <span id="subtotal" className="font-semibold text-gray-700">₹{subtotalDisplay}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1">
            GST
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">5%</span>
          </span>
          <span id="gstAmount" className="font-semibold text-gray-700">₹{gstDisplay}</span>
        </div>
      </div>

      {/* Print footer note */}
      <div className="hidden print:block px-5 py-3 border-t border-dashed border-gray-200 text-center">
        <p className="text-xs text-gray-400">Thank you for visiting Zweeti Fast Food! 🍔</p>
      </div>
    </div>
  );
}

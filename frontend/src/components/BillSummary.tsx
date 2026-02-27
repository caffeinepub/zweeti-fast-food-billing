import { Trash2 } from 'lucide-react';
import { BillItem } from '../App';

interface BillSummaryProps {
  customerName: string;
  items: BillItem[];
  subtotal: number;
  gst: number;
  grandTotal: number;
  onRemoveItem: (id: number) => void;
}

export default function BillSummary({
  customerName,
  items,
  subtotal,
  gst,
  grandTotal,
  onRemoveItem,
}: BillSummaryProps) {
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
        <span className="text-orange-100 text-xs font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="zweeti-table-header">
              <th className="text-left px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wide">Item</th>
              <th className="text-center px-3 py-2.5 text-xs font-bold text-white uppercase tracking-wide">Price</th>
              <th className="text-center px-3 py-2.5 text-xs font-bold text-white uppercase tracking-wide">Qty</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wide">Total</th>
              <th className="px-2 py-2.5 print:hidden"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={item.id}
                className="zweeti-table-row"
              >
                <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                <td className="px-3 py-3 text-center text-gray-600">₹{item.price.toFixed(2)}</td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-xs zweeti-qty-badge">
                    {item.qty}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">₹{item.total.toFixed(2)}</td>
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
        </table>
      </div>

      {/* Totals */}
      <div className="px-5 py-4 space-y-2 border-t border-dashed border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Subtotal</span>
          <span className="font-semibold text-gray-700">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1">
            GST
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">5%</span>
          </span>
          <span className="font-semibold text-gray-700">₹{gst.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-300">
          <span className="font-bold text-gray-800 text-base">Grand Total</span>
          <span className="font-extrabold zweeti-orange-text text-xl">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Print footer note */}
      <div className="hidden print:block px-5 py-3 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">Thank you for visiting Zweeti Fast Food! 🍔</p>
        <p className="text-xs text-gray-400 mt-0.5">GST @ 5% included in Grand Total</p>
      </div>
    </div>
  );
}

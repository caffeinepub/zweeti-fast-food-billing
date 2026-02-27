import { useState } from 'react';
import { Plus } from 'lucide-react';

interface MenuItem {
  name: string;
  price: number;
  emoji: string;
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'Chaumin', price: 40, emoji: '🍜' },
  { name: 'Paneer Chaumin', price: 60, emoji: '🍜' },
  { name: 'Mushroom Chaumin', price: 60, emoji: '🍄' },
  { name: 'Chilli Chaumin', price: 50, emoji: '🌶️' },
  { name: 'Veg Momo', price: 60, emoji: '🥟' },
  { name: 'Paneer Momos', price: 80, emoji: '🥟' },
  { name: 'Veg Pasta', price: 40, emoji: '🍝' },
  { name: 'Paneer Pasta', price: 60, emoji: '🍝' },
  { name: 'Cream Pasta', price: 60, emoji: '🍝' },
  { name: 'Veg Roll', price: 40, emoji: '🌯' },
  { name: 'Paneer Roll', price: 60, emoji: '🌯' },
  { name: 'Veg Burger', price: 30, emoji: '🍔' },
  { name: 'Paneer Burger', price: 50, emoji: '🍔' },
];

interface BillingFormProps {
  onAddItem: (name: string, price: number, qty: number) => void;
}

export default function BillingForm({ onAddItem }: BillingFormProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');

  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = MENU_ITEMS.find(m => m.name === e.target.value) || null;
    setSelectedItem(found);
    setError('');
  };

  const handleAdd = () => {
    const qtyNum = parseInt(qty, 10);
    if (!selectedItem) {
      setError('Please select an item.');
      return;
    }
    if (!qty || isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please enter a valid quantity (≥ 1).');
      return;
    }
    setError('');
    onAddItem(selectedItem.name, selectedItem.price, qtyNum);
    setQty('');
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="zweeti-card print:hidden">
      <h2 className="text-sm font-bold uppercase tracking-wider mb-4 zweeti-orange-text">
        Add Items
      </h2>

      <div className="space-y-3">
        {/* Item Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Select Item
          </label>
          <select
            value={selectedItem?.name || ''}
            onChange={handleItemSelect}
            className="w-full px-4 py-2.5 rounded-[5px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 focus:border-[#ff5722] text-gray-800 font-medium text-sm bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="">-- Select Item --</option>
            {MENU_ITEMS.map(item => (
              <option key={item.name} value={item.name}>
                {item.emoji} {item.name} — ₹{item.price}
              </option>
            ))}
          </select>
        </div>

        {/* Price & Qty Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Unit Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
              <input
                type="number"
                value={selectedItem ? selectedItem.price : ''}
                readOnly
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-[5px] border border-gray-200 bg-gray-50 text-gray-600 font-semibold text-sm cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Quantity
            </label>
            <input
              type="number"
              value={qty}
              onChange={e => { setQty(e.target.value); setError(''); }}
              onKeyDown={handleQtyKeyDown}
              placeholder="1"
              min="1"
              className="w-full px-4 py-2.5 rounded-[5px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 focus:border-[#ff5722] text-gray-800 font-medium text-sm transition-all"
            />
          </div>
        </div>

        {/* Line Total Preview */}
        {selectedItem && qty && parseInt(qty) > 0 && (
          <div className="rounded-[5px] px-4 py-2.5 flex items-center justify-between" style={{ background: '#fff3ef' }}>
            <span className="text-xs font-semibold" style={{ color: '#ff5722' }}>Line Total</span>
            <span className="text-sm font-bold zweeti-orange-text">
              ₹{(selectedItem.price * parseInt(qty)).toFixed(2)}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="zweeti-btn-orange w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Quick Menu Cards */}
      <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Select</p>
        <div className="grid grid-cols-4 gap-2">
          {MENU_ITEMS.map(item => (
            <button
              key={item.name}
              onClick={() => { setSelectedItem(item); setError(''); }}
              className={`flex flex-col items-center gap-1 p-2 rounded-[5px] border-2 transition-all text-center ${
                selectedItem?.name === item.name
                  ? 'border-[#ff5722] bg-[#fff3ef]'
                  : 'border-gray-100 hover:border-[#ff5722]/40 hover:bg-[#fff3ef]/50'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[10px] font-semibold text-gray-600 leading-tight">{item.name}</span>
              <span className="text-[10px] font-bold zweeti-orange-text">₹{item.price}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

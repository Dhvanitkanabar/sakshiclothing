// Reading this as: PIN Code Delivery Modal for Sakshi Clothing Indian Fashion & Jewellery, with real-time postal validation and Surat dispatch estimates. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React, { useState, useEffect } from 'react';
import { MapPin, Truck, CheckCircle2, AlertCircle, Banknote, Sparkles, X } from 'lucide-react';
import { checkPincodeDelivery, savePincode, getSavedPincode, PincodeResult, clearSavedPincode } from '../utils/pincode';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

export interface PincodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPincode?: (pin: string) => void;
}

export const PincodeModal: React.FC<PincodeModalProps> = ({
  isOpen,
  onClose,
  onSelectPincode,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedPincode();
      if (saved) {
        setPinInput(saved);
        setResult(checkPincodeDelivery(saved));
      }
    }
  }, [isOpen]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleaned = pinInput.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
      setError('Please enter a valid 6-digit Indian postal PIN code.');
      setResult(null);
      return;
    }

    const res = checkPincodeDelivery(cleaned);
    setResult(res);
    if (res.isServiceable) {
      savePincode(cleaned);
      if (onSelectPincode) onSelectPincode(cleaned);
    }
  };

  const handleClear = () => {
    clearSavedPincode();
    setPinInput('');
    setResult(null);
    setError(null);
    if (onSelectPincode) onSelectPincode('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check Delivery & COD Availability" maxWidth="md">
      <div className="p-6 flex flex-col gap-5">
        <p className="text-xs sm:text-sm text-[#5C5855] leading-relaxed">
          Orders are dispatched directly from our <strong>Surat warehouse</strong>. Enter your 6-digit postal PIN code to view delivery timelines and Cash on Delivery availability.
        </p>

        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B1E2B]" />
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPinInput(val);
                setError(null);
              }}
              placeholder="Enter 6-digit PIN code (e.g. 394105)"
              className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl text-base text-[#111111] focus:bg-white focus:outline-none focus:border-[#7B1E2B] focus:ring-1 focus:ring-[#7B1E2B] transition-all"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="shrink-0 min-w-[120px]">
            Check PIN
          </Button>
        </form>

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#B43E2B] font-medium bg-[#FDF2F0] p-3 rounded-xl border border-[#F8D7DA]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && result.isServiceable && (
          <div className="bg-[#FAF8F5] border border-[#E8E5DF] rounded-2xl p-4.5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                <div>
                  <span className="font-semibold text-sm text-[#111111]">
                    PIN {result.pincode} — {result.region}
                  </span>
                  <p className="text-xs text-[#15803D] font-medium">Serviceable Pan-India Delivery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-[#7B1E2B] hover:underline font-medium"
              >
                Change PIN
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-[#E8E5DF]/60">
                <Truck className="w-4 h-4 text-[#7B1E2B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#111111]">Estimated Arrival</p>
                  <p className="text-[#5C5855] mt-0.5">{result.estimatedDays}</p>
                  <p className="text-[11px] text-[#7B1E2B] font-medium mt-0.5">{result.deliveryDateStr}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-[#E8E5DF]/60">
                <Banknote className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#111111]">Cash on Delivery</p>
                  <p className="text-[#15803D] font-medium mt-0.5">Available</p>
                  <p className="text-[10px] text-[#5C5855] mt-0.5">Free over ₹{result.freeShippingThreshold}</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#5C5855] leading-relaxed pt-1">
              {result.message}
            </p>
          </div>
        )}

        {/* Popular Metro Quick Select Chips */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B1E2B] mb-2">
            Popular Transit Hubs
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Surat (Hub)', pin: '394105' },
              { label: 'Ahmedabad', pin: '380001' },
              { label: 'Mumbai', pin: '400001' },
              { label: 'Delhi NCR', pin: '110001' },
              { label: 'Bengaluru', pin: '560001' },
              { label: 'Hyderabad', pin: '500001' },
            ].map((hub) => (
              <button
                key={hub.pin}
                type="button"
                onClick={() => {
                  setPinInput(hub.pin);
                  const res = checkPincodeDelivery(hub.pin);
                  setResult(res);
                  savePincode(hub.pin);
                  if (onSelectPincode) onSelectPincode(hub.pin);
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  pinInput === hub.pin
                    ? 'bg-[#7B1E2B] text-white border-[#7B1E2B]'
                    : 'bg-white text-[#5C5855] border-[#E8E5DF] hover:border-[#7B1E2B] hover:text-[#7B1E2B]'
                }`}
              >
                {hub.label} ({hub.pin})
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E8E5DF]">
          <Button variant="outline" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PincodeModal;

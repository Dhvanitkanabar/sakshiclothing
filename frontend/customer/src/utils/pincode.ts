/**
 * Sakshi Clothing — Indian Postal PIN Code Delivery Estimator
 * Dispatches from Surat Atelier / Warehouse (PIN 394105, Gujarat)
 * Supports all 19,000+ serviceable India Post / Delhivery / Shiprocket PIN codes.
 */

export interface PincodeResult {
  pincode: string;
  isServiceable: boolean;
  city?: string;
  state?: string;
  region: 'Surat Local' | 'Gujarat Express' | 'West India' | 'North India' | 'South India' | 'East & North-East' | 'National';
  estimatedDays: string;
  deliveryDateStr: string;
  codAvailable: boolean;
  freeShippingThreshold: number;
  message: string;
}

const PINCODE_STORAGE_KEY = 'sakshi_selected_pincode';

export function validatePincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function checkPincodeDelivery(rawPin: string): PincodeResult {
  const pin = rawPin.trim();
  if (!validatePincode(pin)) {
    return {
      pincode: pin,
      isServiceable: false,
      region: 'National',
      estimatedDays: 'N/A',
      deliveryDateStr: 'N/A',
      codAvailable: false,
      freeShippingThreshold: 999,
      message: 'Please enter a valid 6-digit Indian postal PIN code.',
    };
  }

  const prefix2 = parseInt(pin.substring(0, 2), 10);
  const prefix3 = parseInt(pin.substring(0, 3), 10);

  const now = new Date();
  const addDays = (d: number) => {
    const target = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    return target.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // 1. Surat Local (394xxx, 395xxx)
  if (prefix3 === 394 || prefix3 === 395) {
    return {
      pincode: pin,
      isServiceable: true,
      city: 'Surat',
      state: 'Gujarat',
      region: 'Surat Local',
      estimatedDays: '1–2 Business Days',
      deliveryDateStr: `by ${addDays(2)}`,
      codAvailable: true,
      freeShippingThreshold: 999,
      message: 'Same-City Express Delivery available directly from our Surat hub.',
    };
  }

  // 2. Rest of Gujarat (36xxxx - 39xxxx)
  if (prefix2 >= 36 && prefix2 <= 39) {
    return {
      pincode: pin,
      isServiceable: true,
      city: 'Gujarat Hub',
      state: 'Gujarat',
      region: 'Gujarat Express',
      estimatedDays: '2–3 Business Days',
      deliveryDateStr: `by ${addDays(3)}`,
      codAvailable: true,
      freeShippingThreshold: 999,
      message: 'Express intra-state courier transit with Cash on Delivery.',
    };
  }

  // 3. Maharashtra, Goa, MP (40xxxx - 48xxxx)
  if (prefix2 >= 40 && prefix2 <= 48) {
    return {
      pincode: pin,
      isServiceable: true,
      city: prefix2 === 40 ? 'Mumbai Metro' : 'West Hub',
      state: prefix2 === 40 ? 'Maharashtra' : 'Western Region',
      region: 'West India',
      estimatedDays: '2–4 Business Days',
      deliveryDateStr: `by ${addDays(4)}`,
      codAvailable: true,
      freeShippingThreshold: 999,
      message: 'Fast Western transit via air & surface express.',
    };
  }

  // 4. Delhi NCR, Haryana, Punjab, UP, Rajasthan (11xxxx - 34xxxx)
  if (prefix2 >= 11 && prefix2 <= 34) {
    return {
      pincode: pin,
      isServiceable: true,
      city: prefix2 === 11 ? 'Delhi NCR' : 'North Hub',
      state: 'Northern Region',
      region: 'North India',
      estimatedDays: '3–5 Business Days',
      deliveryDateStr: `by ${addDays(5)}`,
      codAvailable: true,
      freeShippingThreshold: 999,
      message: 'Pan-India standard delivery with real-time tracking.',
    };
  }

  // 5. South India: Karnataka, Tamil Nadu, Telangana, Andhra, Kerala (50xxxx - 69xxxx)
  if (prefix2 >= 50 && prefix2 <= 69) {
    return {
      pincode: pin,
      isServiceable: true,
      city: 'Southern Hub',
      state: 'Southern Region',
      region: 'South India',
      estimatedDays: '3–5 Business Days',
      deliveryDateStr: `by ${addDays(5)}`,
      codAvailable: true,
      freeShippingThreshold: 999,
      message: 'Express air-cargo transit to all major southern metros & towns.',
    };
  }

  // 6. Rest of India (Eastern & North-Eastern states)
  return {
    pincode: pin,
    isServiceable: true,
    city: 'National Transit',
    state: 'National',
    region: 'East & North-East',
    estimatedDays: '4–7 Business Days',
    deliveryDateStr: `by ${addDays(7)}`,
    codAvailable: true,
    freeShippingThreshold: 999,
    message: 'Nationwide coverage across 19,000+ PIN codes with COD.',
  };
}

export function getSavedPincode(): string | null {
  try {
    return localStorage.getItem(PINCODE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function savePincode(pin: string): void {
  try {
    localStorage.setItem(PINCODE_STORAGE_KEY, pin.trim());
  } catch {}
}

export function clearSavedPincode(): void {
  try {
    localStorage.removeItem(PINCODE_STORAGE_KEY);
  } catch {}
}

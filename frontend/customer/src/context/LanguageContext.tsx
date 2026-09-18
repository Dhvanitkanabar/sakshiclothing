import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'gu';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & General UI
    'nav.home': 'Home',
    'nav.women': 'Women',
    'nav.men': 'Men',
    'nav.jewellery': 'Jewellery',
    'nav.shop': 'Shop',
    'nav.trackOrder': 'Track Order',
    'nav.findStore': 'Find a Store',
    'nav.login': 'Login',
    'nav.profile': 'My Profile',
    'nav.signOut': 'Sign Out',
    'nav.currency': 'INR ₹',
    
    // Product & Catalogue
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    'product.selectSize': 'Select Size',
    'product.quantity': 'Quantity',
    'product.description': 'Description',
    'product.reviews': 'Reviews',
    
    // Cart & Checkout
    'cart.title': 'Shopping Bag',
    'cart.empty': 'Your bag is empty',
    'cart.checkout': 'Proceed to Checkout',
    'cart.total': 'Subtotal',
    'cart.remove': 'Remove',
    
    // Common
    'common.search': 'Search collections...',
    'common.loading': 'Loading...',
    'common.viewAll': 'View All',
    'common.freeShipping': 'Free Shipping on all orders'
  },
  hi: {
    // Navigation & General UI
    'nav.home': 'होम',
    'nav.women': 'महिलाएं',
    'nav.men': 'पुरुष',
    'nav.jewellery': 'आभूषण',
    'nav.shop': 'दुकान',
    'nav.trackOrder': 'ऑर्डर ट्रैक करें',
    'nav.findStore': 'स्टोर खोजें',
    'nav.login': 'लॉग इन',
    'nav.profile': 'मेरी प्रोफ़ाइल',
    'nav.signOut': 'साइन आउट',
    'nav.currency': 'INR ₹',
    
    // Product & Catalogue
    'product.addToCart': 'कार्ट में जोड़ें',
    'product.buyNow': 'अभी खरीदें',
    'product.outOfStock': 'स्टॉक में नहीं है',
    'product.inStock': 'स्टॉक में है',
    'product.selectSize': 'साइज चुनें',
    'product.quantity': 'मात्रा',
    'product.description': 'विवरण',
    'product.reviews': 'समीक्षाएं',
    
    // Cart & Checkout
    'cart.title': 'शॉपिंग बैग',
    'cart.empty': 'आपका बैग खाली है',
    'cart.checkout': 'चेकआउट करें',
    'cart.total': 'कुल योग',
    'cart.remove': 'हटाएं',
    
    // Common
    'common.search': 'कलेक्शन खोजें...',
    'common.loading': 'लोड हो रहा है...',
    'common.viewAll': 'सभी देखें',
    'common.freeShipping': 'सभी ऑर्डर पर मुफ़्त शिपिंग'
  },
  gu: {
    // Navigation & General UI
    'nav.home': 'હોમ',
    'nav.women': 'મહિલાઓ',
    'nav.men': 'પુરુષો',
    'nav.jewellery': 'દાગીના',
    'nav.shop': 'શોપ',
    'nav.trackOrder': 'ઓર્ડર ટ્રેક કરો',
    'nav.findStore': 'સ્ટોર શોધો',
    'nav.login': 'લોગિન',
    'nav.profile': 'મારી પ્રોફાઇલ',
    'nav.signOut': 'સાઇન આઉટ',
    'nav.currency': 'INR ₹',
    
    // Product & Catalogue
    'product.addToCart': 'કાર્ટમાં ઉમેરો',
    'product.buyNow': 'હમણાં ખરીદો',
    'product.outOfStock': 'સ્ટોકમાં નથી',
    'product.inStock': 'સ્ટોકમાં છે',
    'product.selectSize': 'સાઇઝ પસંદ કરો',
    'product.quantity': 'જથ્થો',
    'product.description': 'વર્ણન',
    'product.reviews': 'સમીક્ષાઓ',
    
    // Cart & Checkout
    'cart.title': 'શોપિંગ બેગ',
    'cart.empty': 'તમારી બેગ ખાલી છે',
    'cart.checkout': 'ચેકઆઉટ કરો',
    'cart.total': 'કુલ રકમ',
    'cart.remove': 'દૂર કરો',
    
    // Common
    'common.search': 'શોધો...',
    'common.loading': 'લોડ થઈ રહ્યું છે...',
    'common.viewAll': 'બધા જુઓ',
    'common.freeShipping': 'તમામ ઓર્ડર પર મફત શિપિંગ'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sakshi-language');
    return (saved === 'hi' || saved === 'gu' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sakshi-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

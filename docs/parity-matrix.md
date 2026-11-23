# Sakshi Clothing — Device Parity & Responsiveness Matrix

This document provides a comprehensive audit and verification of feature and layout parity across mobile (**390px**), tablet (**768px**), and desktop (**1280px**) viewport sizes.

## Breakpoint Architecture
- **xs / Compact Mobile**: `360px` – `389px` (Android small / iOS mini)
- **sm / Standard Mobile**: `390px` – `767px` (iPhone 14/15/16, Galaxy S23/S24, Pixel 8)
- **md / Tablet**: `768px` – `1023px` (iPad, tablet portrait / landscape)
- **lg / Compact Desktop**: `1024px` – `1279px` (Laptops, small monitors)
- **xl / Desktop**: `1280px` – `1535px` (Standard desktop monitors)
- **2xl / Large Canvas**: `1536px+` (Ultrawide / high-res displays)

---

## 1. Global Navigation & Chrome Parity

| Feature / Flow | Mobile (390px) | Tablet (768px) | Desktop (1280px) | Hover & Tap Equivalent | Notes |
|:---|:---:|:---:|:---:|:---|:---|
| **Top Announcement Ticker** | ✅ | ✅ | ✅ | Ticker auto-scrolls; tap/hover pauses | Contains verified shipping & COD config |
| **Working PIN Delivery Check** | ✅ | ✅ | ✅ | Tap pill opens modal; click opens modal | Saves to `localStorage`; real SLA estimate |
| **Brand Logo & Wordmark** | ✅ | ✅ | ✅ | Tap / click navigates Home | Shrinks smoothly on scroll |
| **Primary Category Nav** | ✅ (Drawer) | ✅ (Drawer/Nav) | ✅ (Mega Menu) | Tap accordion / Hover dropdown | 6 items: Women, Men, Kids, Jewellery, New In, Sale |
| **Instant Search (⌘K)** | ✅ | ✅ | ✅ | Tap search icon / Click or ⌘K | Live suggestions + direct result cards |
| **Saved Wishlist Badge** | ✅ | ✅ | ✅ | Tap badge / Click badge | Spring animation on count change |
| **Shopping Cart Trigger** | ✅ | ✅ | ✅ | Tap bag / Click bag | Bouncy spring badge with live quantity |
| **Floating WhatsApp Support** | ✅ | ✅ | ✅ | Tap opens WA / Hover shows tooltip | Sourced from `BUSINESS_CONFIG.whatsappUrl` |
| **Scroll Progress Bar** | ✅ | ✅ | ✅ | Continuous top track | Hardware-accelerated `motion/react` spring |

---

## 2. Scroll-Driven Homepage Parity

| Homepage Section | Mobile (390px) | Tablet (768px) | Desktop (1280px) | Touch / Tap Ergonomics | Notes |
|:---|:---:|:---:|:---:|:---|:---|
| **1. Full-Width Campaign Hero** | ✅ | ✅ | ✅ | Swipe slider / Arrow clicks | Separate portrait (mobile) & wide (desktop) art-directed crops |
| **2. Offer Marquee Strip** | ✅ | ✅ | ✅ | Tap pauses / Hover pauses | Infinite ticker driven by real store config |
| **3. Category Tiles** | ✅ (Snap Rail) | ✅ (2x2 Grid) | ✅ (4-Col Grid) | Horizontal swipe / Click | Responsive transition from snap-rail to grid |
| **4. Trending Rail** | ✅ (Swipe Rail) | ✅ (Scroll Rail) | ✅ (Rail + Arrows) | Horizontal drag / Arrow buttons | Category filter tabs (All, Clothing, Jewellery) |
| **5. "Shop the Look" Pinned Canvas** | ✅ | ✅ | ✅ | Tap numbered pins / Hover & click | Hotspot pins toggle outfit & jewellery popups |
| **6. Imitation Jewellery Spotlight** | ✅ | ✅ | ✅ | Stacked layout / Side-by-side | Arched mask image reveal with macro detail |
| **7. Brand Story & Surat Hub** | ✅ | ✅ | ✅ | Vertical stack / Dual columns | Verifiable stats only (19k PINs, 7d, 18% GST) |
| **8. Real Reviews Marquee** | ✅ | ✅ | ✅ | Tap card / Hover pauses | Auto-hides gracefully if 0 reviews exist |
| **9. Lookbook Bento Grid** | ✅ (2-Col Dense) | ✅ (3-Col Dense) | ✅ (4-Col Bento) | Tap opens product / Hover zoom | `grid-auto-flow: dense` with zero void cells |
| **10. Newsletter & Wordmark** | ✅ | ✅ | ✅ | Standard touch inputs | Ambient `"SAKSHI"` serif display reveal |

---

## 3. Storefront Pages & Customer Dashboard

| Page / Flow | Mobile (390px) | Tablet (768px) | Desktop (1280px) | Empty State (0 Items) | Dense State (100 Items) |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Shop & Catalog** | ✅ | ✅ | ✅ | Clear filters button + empty illustration | Infinite / paginated responsive grid |
| **Category Landing** | ✅ | ✅ | ✅ | Graceful empty message | Subcategory filtering tabs |
| **Product Details** | ✅ | ✅ | ✅ | "Sold Out" state with disabled CTA | Multiple thumbnail gallery rail |
| **Cart Drawer** | ✅ | ✅ | ✅ | "Your bag is empty" + Explore CTA | Scrollable list with free shipping meter |
| **Full Cart Page** | ✅ | ✅ | ✅ | "Empty Bag" with category shortcuts | Order summary sidebar with discount codes |
| **Checkout (Initiate & Pay)** | ✅ | ✅ | ✅ | N/A (requires items) | Split summary & shipping forms |
| **Order Success** | ✅ | ✅ | ✅ | N/A | Order summary, items, payment ID |
| **Track Order** | ✅ | ✅ | ✅ | "Order not found" error toast | Live timeline checkpoints (Surat dispatch) |
| **Customer Overview** | ✅ | ✅ | ✅ | Clean onboarding checklist | Summary cards (orders, spent, points) |
| **My Orders** | ✅ | ✅ | ✅ | "No orders placed yet" | Expandable order history cards |
| **My Wishlist** | ✅ | ✅ | ✅ | "Your wishlist is empty" | Responsive grid with 1-tap "Move to Bag" |
| **Saved Addresses** | ✅ | ✅ | ✅ | "Add new address" button | Grid of address cards with edit/delete |
| **Profile Settings** | ✅ | ✅ | ✅ | Default avatar fallback | Personal info, email, phone edit |
| **Loyalty & Rewards** | ✅ | ✅ | ✅ | 0 points state | Tier progress (Silver/Gold/Patron) |

---

## 4. Admin Panel Parity

| Admin Module | Mobile (390px) | Tablet (768px) | Desktop (1280px) | Touch Target Safety | Notes |
|:---|:---:|:---:|:---:|:---:|:---|
| **Product List** | ✅ (Card view) | ✅ (Compact table) | ✅ (Full table) | All buttons &gt;= 44px | Displays visible `DEMO` badge |
| **Product Create/Edit** | ✅ | ✅ | ✅ | Safe inputs with label associations | Variant matrix, stock, category tags |
| **Order Management** | ✅ | ✅ | ✅ | Touch-friendly status actions | Genuine order verification, tracking updates |
| **CMS & Banners** | ✅ | ✅ | ✅ | Drag & file upload support | Upload mobile portrait & desktop wide crops |

---

## 5. Touch Target & Accessibility Verification

1. **Touch Target Rule**: Every interactive element (buttons, links, form controls, tabs, menu toggles) has a bounding box of at least **44x44px** on mobile viewports.
2. **iOS Auto-Zoom Prevention**: All text inputs (`input[type="text"]`, `input[type="email"]`, `input[type="tel"]`) have an effective font size of **16px** on mobile to prevent iOS Safari auto-zooming.
3. **Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`. When enabled, parallax and marquee transforms are disabled.

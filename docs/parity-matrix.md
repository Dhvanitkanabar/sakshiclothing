# Sakshi Clothing — Device Parity, Policy & Motion Matrix

This document provides a comprehensive audit and verification of feature parity, policy flows, motion upgrades, and layout responsiveness across mobile (**390px**), tablet (**768px**), and desktop (**1280px**) viewport sizes.

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
| **Top Announcement Ticker** | ✅ | ✅ | ✅ | Ticker auto-scrolls; tap/hover pauses | Shows: "Free Express Delivery on orders above ₹300" & "No Returns — 48h Transit Damage Guarantee" |
| **Working PIN Delivery Check** | ✅ | ✅ | ✅ | Tap pill opens modal; click opens modal | Saves to `localStorage`; free delivery above ₹300 verified |
| **Brand Logo & Wordmark** | ✅ | ✅ | ✅ | Tap / click navigates Home | Shrinks smoothly on scroll |
| **Primary Category Nav** | ✅ (Drawer) | ✅ (Drawer/Nav) | ✅ (Mega Menu) | Tap accordion / Hover dropdown | 6 items: Women, Men, Kids, Jewellery, New In, Sale |
| **Instant Search (⌘K)** | ✅ | ✅ | ✅ | Tap search icon / Click or ⌘K | Live suggestions + direct result cards |
| **Saved Wishlist Badge** | ✅ | ✅ | ✅ | Tap badge / Click badge | Spring animation on count change |
| **Shopping Cart Trigger** | ✅ | ✅ | ✅ | Tap bag / Click bag | Free shipping progress meter towards ₹300 threshold |
| **Floating WhatsApp Support** | ✅ | ✅ | ✅ | Tap opens WA / Hover shows tooltip | Direct atelier concierge |
| **Scroll Progress Bar** | ✅ | ✅ | ✅ | Continuous top track | Hardware-accelerated `motion/react` spring (CLS: 0.00) |

---

## 2. Scroll-Driven Homepage Parity & Motion Suite (Change C)

| Homepage Section | Mobile (390px) | Tablet (768px) | Desktop (1280px) | Motion & Animation Behavior | Notes |
|:---|:---:|:---:|:---:|:---|:---|
| **1. Full-Width Campaign Hero** | ✅ | ✅ | ✅ | Slider with opacity cross-fade + micro-scale (500ms cubic-bezier) | Portrait on mobile, wide on desktop |
| **2. Offer Marquee Strip** | ✅ | ✅ | ✅ | Seamless infinite ticker (35s linear); pauses on tap/hover | Reflects Free Delivery above ₹300 and 48h Transit Guarantee |
| **3. Category Tiles** | ✅ (Snap Rail) | ✅ (2x2 Grid) | ✅ (4-Col Grid) | Staggered fade-up (`whileInView`, delay 0.08s) | Responsive swipe-rail to grid transition |
| **4. Trending Rail** | ✅ (Swipe Rail) | ✅ (Scroll Rail) | ✅ (Rail + Arrows) | Horizontal drag with spring bounds | Category filter tabs (All, Clothing, Jewellery) |
| **5. "Shop the Look" Pinned Canvas** | ✅ | ✅ | ✅ | Interactive hotspot pin pulse + popover card | Tap pins on mobile; hover/click on desktop |
| **6. Imitation Jewellery Spotlight** | ✅ | ✅ | ✅ | Arched mask image reveal with macro detail | Warm gold `#C6A15B` accents restricted to jewellery |
| **7. Brand Story & Facts Strip** | ✅ | ✅ | ✅ | `AnimatedCounter` counting up on view entry (400–700ms) | Verifiable metrics (19k PINs, 48h Window, 18% GST, ₹300 Cap) |
| **8. Real Reviews Marquee** | ✅ | ✅ | ✅ | Gentle floating cards with star ratings | Hides gracefully if 0 reviews exist |
| **9. Lookbook Bento Grid** | ✅ (2-Col Dense) | ✅ (3-Col Dense) | ✅ (4-Col Bento) | Subtle image zoom on hover/tap; `grid-auto-flow: dense` | Zero empty void cells |
| **10. Newsletter & Wordmark** | ✅ | ✅ | ✅ | Ambient `"SAKSHI"` serif display reveal on scroll | Clean email input with instant validation |

---

## 3. Storefront Pages, Checkout & Policy Parity (Changes A & B)

| Page / Flow | Mobile (390px) | Tablet (768px) | Desktop (1280px) | Free Delivery & Policy Implementation |
|:---|:---:|:---:|:---:|:---|
| **Product Details** | ✅ | ✅ | ✅ | • Schema.org `MerchantReturnNotPermitted`<br>• "No returns (damaged or wrong items covered within 48h)" notice strip<br>• Dynamic "Free delivery above ₹300" delivery calculator |
| **Cart Drawer** | ✅ | ✅ | ✅ | • Interactive progress bar to ₹300 threshold ("Add ₹X for FREE Delivery")<br>• "No returns (damaged or wrong items covered within 48h)" trust badge |
| **Cart Page** | ✅ | ✅ | ✅ | • Dynamic threshold progress bar<br>• Shipping calculation shows ₹0 (FREE) when subtotal >= ₹300, else ₹49<br>• No-Return Policy trust notice |
| **Checkout (Initiate & Pay)** | ✅ | ✅ | ✅ | • Mandatory checkbox: *"I acknowledge and accept the No-Return Policy. (Transit damage or defects covered within 48h with unboxing proof)."*<br>• Blocks payment if unchecked<br>• Stores `noReturnPolicyAcknowledged: true` on Order<br>• Razorpay initiated with exact server amount |
| **Order Details / Profile** | ✅ | ✅ | ✅ | • Shows order status, timeline, invoice download<br>• If order delivered/shipped: **"Report Damage / Issue"** button opens claim modal<br>• If claim submitted: shows real-time claim status and review note |
| **Refund Policy Page** | ✅ | ✅ | ✅ | • Complete rewrite with `[LAWYER_REVIEW]` tags<br>• Detailed 48-hour unboxing video claim protocol<br>• Pre-dispatch cancellation 5–7 day refund clause |
| **Shipping Policy Page** | ✅ | ✅ | ✅ | • Dynamic ₹300 free shipping threshold<br>• Configurable ₹49 standard shipping fee<br>• 19,000+ PIN codes and tracking protocols |

---

## 4. Admin Panel Claims & Fulfillment Parity

| Admin Module | Mobile (390px) | Tablet (768px) | Desktop (1280px) | Touch Target Safety | Notes |
|:---|:---:|:---:|:---:|:---|:---|
| **Order Details - Claims Suite** | ✅ | ✅ | ✅ | All controls &gt;= 44px | Displays submitted claim, reason, unboxing video link, photo evidence, and resolution dropdown (`replacement`, `refund_to_source`, `none`) |
| **Order Details - Fraud Audit** | ✅ | ✅ | ✅ | Touch-friendly cards | Displays No-Return Policy Legal Consent checkbox verification from checkout |
| **Order Details - Financials** | ✅ | ✅ | ✅ | Clean breakdown | Shows Items Subtotal, Coupon Discount, Shipping Fee (₹0 Free above ₹300 or ₹49), COD fee, Grand Total |
| **Order Fulfillment Pipeline** | ✅ | ✅ | ✅ | Interactive stepper | Approval, live logistics checkpoints, and dispatch |

---

## 5. Mobile Ergonomics & Performance Compliance

1. **Touch Targets**: All interactive elements (buttons, links, form selects, toggles) have an explicit minimum touch bounding box of **44x44px** on mobile.
2. **iOS Font Zoom**: All inputs maintain `text-base` (16px) on mobile viewports, eliminating unwanted iOS Safari auto-zooming.
3. **Cumulative Layout Shift (CLS)**: Pre-allocated aspect ratio boxes (`aspect-[3/4]`, `aspect-video`) and hardware-accelerated transforms ensure CLS &lt; 0.05.
4. **Reduced Motion**: Motion hooks strictly observe `@media (prefers-reduced-motion: reduce)`.

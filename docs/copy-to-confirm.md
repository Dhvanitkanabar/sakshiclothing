# Copy to Confirm — Business Claims, Policy Verification & Legal Review

**Store:** Sakshi Clothing, Surat, Gujarat  
**Review Status:** Pending Owner / Legal Counsel / Chartered Accountant Confirmation  
**Last Updated:** Phase 3 / Redesign v2 Implementation  

This document lists all marketing claims, operational policies, shipping rules, and legal parameters implemented across the Sakshi Clothing platform. Items requiring formal sign-off from legal counsel or the business owners are flagged with `[LAWYER_REVIEW]` or `[CONFIRM]`.

---

## 1. Shipping Policy & Delivery Economics (Change A)

1. `[CONFIRM]` **Free Delivery Threshold (₹300):**  
   *Current Implementation:* Free delivery is automatically granted on any order where the cart subtotal *after discounts and before shipping* is greater than or equal to ₹300 (`subtotalAfterDiscount >= 300`). Configured dynamically via `BUSINESS_CONFIG.shipping.freeShippingThreshold` in `backend/src/config/business.config.js` and exposed via `GET /api/v1/cms/business-config`.  
   *Action Needed:* Confirm whether ₹300 provides sufficient gross margin to absorb courier shipping costs across all Indian states or if higher weight items should carry special handling fees.

2. `[CONFIRM]` **Standard Shipping Charge Below Threshold (₹49):**  
   *Current Implementation:* When subtotal after discount is strictly less than ₹300, a flat shipping charge of ₹49 is added to the grand total. Configured via `BUSINESS_CONFIG.shipping.defaultShippingCharge` (or env `DEFAULT_SHIPPING_FEE`).  
   *Action Needed:* Confirm if ₹49 covers regional and national courier contracts (Shiprocket, Delhivery, Bluedart).

3. `[CONFIRM]` **Cash on Delivery (COD) Handling Fee (₹0):**  
   *Current Implementation:* COD handling fee is currently set to ₹0 (`BUSINESS_CONFIG.shipping.codHandlingFee` or env `COD_HANDLING_FEE`).  
   *Action Needed:* Confirm whether a non-refundable COD verification charge (e.g. ₹29–₹49) should be enabled to curb courier Return-to-Origin (RTO) expenses.

4. `[CONFIRM]` **Dispatch & Delivery Timelines:**  
   *Current Implementation:* Orders dispatched from Surat within 24–48 hours; delivery transit 3–6 business days across 19,000+ PIN codes.  
   *Action Needed:* Confirm whether delivery to Northeast India, Jammu & Kashmir, and remote islands requires a 7–10 business day caveat.

---

## 2. No-Return Policy & 48-Hour Transit Damage Guarantee (Change B)

5. `[LAWYER_REVIEW]` **No Returns / No Exchanges for Change of Mind, Fit, or Color:**  
   *Current Implementation:* The entire storefront (Product pages, Cart drawer, Cart page, Checkout, Navbar, Footer, and Policies) explicitly enforces a strict **No Return Policy**. As budget-friendly artisanal clothing and imitation jewellery, returns for buyer's remorse, subjective fit, size preference, or color variation are strictly not accepted.  
   *Action Needed:* Legal counsel to review compliance under the **Consumer Protection (E-Commerce) Rules, 2020** (Rule 6: Duties of sellers on marketplace/inventory models regarding return disclosures). Explicit notice is rendered before purchase.

6. `[LAWYER_REVIEW]` **Mandatory Checkout Consent Checkbox:**  
   *Current Implementation:* At Checkout, customers MUST actively check the box:  
   *"I acknowledge and accept the No-Return Policy. (Transit damage or defects covered within 48h with unboxing proof)."*  
   The order submission is blocked until this box is checked, and `noReturnPolicyAcknowledged: true` is permanently stored on the Order document.  
   *Action Needed:* Legal counsel to verify whether click-wrap affirmative consent meets statutory evidentiary requirements under Section 10A of the Information Technology Act, 2000.

7. `[LAWYER_REVIEW]` **48-Hour Transit Damage & Defect Reporting Window:**  
   *Current Implementation:* Items that arrive broken, defective, or incorrect are 100% protected if reported within 48 hours of delivery via the customer dashboard or support email. Claims filed beyond 48 hours are rejected as goods are deemed accepted.  
   *Action Needed:* Counsel to confirm enforceability of the 48-hour SLA under Indian Sale of Goods Act, 1930 (Section 42: Acceptance of Goods).

8. `[LAWYER_REVIEW]` **Mandatory Raw 360° Unboxing Video Proof:**  
   *Current Implementation:* To qualify for a free replacement or refund for transit damage, customers must submit an unedited, continuous 360-degree unboxing video demonstrating the sealed package before opening and the damaged item upon opening.  
   *Action Needed:* Counsel to review unboxing video requirement language for compliance with Consumer Dispute Redressal Commission precedents regarding latent transit damages.

9. `[LAWYER_REVIEW]` **Pre-Dispatch Cancellation Refund Policy:**  
   *Current Implementation:* Customers may cancel orders while in `pending` or `processing` status before dispatch. 100% refund is processed to the original payment source via Razorpay within 5–7 business days. Once dispatched, orders cannot be cancelled.  
   *Action Needed:* Confirm refund SLA alignment with RBI e-commerce settlement guidelines.

10. `[LAWYER_REVIEW]` **Product Schema JSON-LD Return Policy Metadata:**  
    *Current Implementation:* In `ProductDetails.tsx`, Schema.org structured data declares:  
    `returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted"`  
    `applicableCountry: "IN"`  
    `returnFees: "https://schema.org/FreeReturn"` (for defective/damaged claims)  
    *Action Needed:* SEO and compliance audit for Google Merchant Center feed alignment.

---

## 3. Product Authenticity & Material Disclosures

11. `[CONFIRM]` **Imitation Jewellery Disclosure:**  
    *Current Disclosure:* All jewellery pieces are explicitly labeled as artificial/imitation fashion jewellery made of brass/copper/zinc alloys with electroplated gold/rhodium polish and synthetic Kundan/American diamond stones. Contains no real gold, silver, or precious gemstones.  
    *Action Needed:* Confirm all suppliers in Surat adhere to this formulation to prevent hallmarking disputes.

12. `[CONFIRM]` **Fabric Descriptions:**  
    *Current Disclosure:* Surat textile weaves, poly-silk blends, georgette, and cotton-blend fabrics. Unverified "pure Varanasi silk" or "authentic Jaipur handloom" claims have been removed.  
    *Action Needed:* Confirm fabric tags match workshop invoices.

---

## 4. Taxation, Invoicing & Corporate Entity

13. `[CONFIRM]` **Legal Entity Name & Constitution:**  
    *Current Setup:* "Sakshi Clothing", Surat, Gujarat.  
    *Action Needed:* Chartered Accountant to provide the exact registered business name (Proprietorship / LLP / Pvt Ltd) to be printed on computerized GST tax invoices.

14. `[CONFIRM]` **GSTIN Registration:**  
    *Current Setup:* `24AABCS1429B1Z1` (placeholder in business config).  
    *Action Needed:* CA to provide the genuine 15-character GST Identification Number issued under the Gujarat Goods and Services Tax Act.

15. `[CONFIRM]` **Tax-Inclusive Pricing Disclosure:**  
    *Current Implementation:* All prices displayed on the website are inclusive of 5% / 12% / 18% GST as applicable to apparel and imitation jewellery. Tax breakdown is explicitly calculated and printed on generated invoice PDFs.  
    *Action Needed:* CA to verify GST rate splits per HSN code on invoice generator.

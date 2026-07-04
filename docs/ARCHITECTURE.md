# Architecture Diagram

```mermaid
graph TD
    Client[Web Browser] --> |HTTP/HTTPS| Frontend[React + Vite (Customer & Admin)]
    Frontend --> |REST API| Backend[Node.js + Express.js]
    Backend --> |Mongoose| MongoDB[(MongoDB Atlas)]
    Backend --> |SDK| Cloudinary[Cloudinary DAM]
    Backend --> |SDK| Stripe[Stripe Payment Gateway]
    Backend --> |SDK| Razorpay[Razorpay Payment Gateway]
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ ADDRESS : has
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ ORDER_ITEM : included_in
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--o| PAYMENT : processed_by
    CATEGORY ||--o{ PRODUCT : categorizes
    BRAND ||--o{ PRODUCT : manufactures
```

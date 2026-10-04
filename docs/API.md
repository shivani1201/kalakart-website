# API (all JSON, cookie auth)
Public: GET /api/health, GET /api/products?q=&category=, POST /api/register, POST /api/login, POST /api/logout, GET /api/me
Customer: POST /api/orders, GET /api/orders/my, POST /api/seller/apply
Seller (approved): GET/POST /api/seller/products, DELETE /api/seller/products/:id, GET /api/seller/orders, PATCH /api/seller/items/:id
Admin: GET /api/admin/overview, PATCH /api/admin/sellers/:id, PATCH /api/admin/products/:id

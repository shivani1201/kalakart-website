# Database (MongoDB, Mongoose)
- users: name, email (unique), phone, password (bcrypt hash, hidden), role (customer|seller|admin), suspended, seller{shop,district,story,approved}
- products: seller -> users, shop, name, description, image, category, price, stock, approved, archived
- orders: user -> users, address, subtotal, shipping, total, payment, items[{product,name,price,qty,seller,shop,status}]
Order items keep a snapshot of name and price so old orders never change. One order can hold items from many sellers; each item has its own status.

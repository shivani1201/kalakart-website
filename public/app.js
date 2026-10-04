const $=s=>document.querySelector(s),CATS=["Pottery","Handloom","Jewellery","Wood","Bamboo","Decor","Gifts","Art"],ST=["Placed","Processing","Packed","Shipped","Delivered","Cancelled"];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inr=n=>"₹"+Number(n).toLocaleString("en-IN"),tint=s=>`hsl(${[...s].reduce((a,c)=>a+c.charCodeAt(0),0)%40+10} 45% 55%)`;
let S={user:null,view:"shop",cart:JSON.parse(localStorage.getItem("cart")||"[]"),q:"",cat:"",d:{}};
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),2500)}
async function api(p,m="GET",b){const r=await fetch("/api"+p,{method:m,headers:{"Content-Type":"application/json"},body:b?JSON.stringify(b):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.message||"Something went wrong");return j}
const save=()=>localStorage.setItem("cart",JSON.stringify(S.cart));
async function go(v){S.view=v;try{
 if(v==="shop")S.d.products=(await api("/products?q="+encodeURIComponent(S.q)+"&category="+S.cat)).products;
 if(v==="orders")S.d.orders=(await api("/orders/my")).orders;
 if(v==="seller"&&S.user.seller&&S.user.seller.approved){S.d.mine=(await api("/seller/products")).products;S.d.so=(await api("/seller/orders")).orders}
 if(v==="admin")S.d.a=await api("/admin/overview");
}catch(e){toast(e.message)}draw()}
const V={
shop:()=>`<h1>Discover the Art of Maharashtra</h1><p class=m>Handmade by local artisans. Pay on delivery.</p>
<form class=row data-f=search><input name=q placeholder="Search products" aria-label="Search" value="${esc(S.q)}"><button class=b>Search</button></form>
<div class=row>${["",...CATS].map(c=>`<button class="chip ${S.cat===c?"on":""}" data-a=cat data-id="${c}">${c||"All"}</button>`).join("")}</div>
<div class=grid>${(S.d.products||[]).map(p=>`<article class=card><div class=art style="background:${tint(p.name)}">${p.image?`<img src="${esc(p.image)}" alt="">`:""}</div><h3>${esc(p.name)}</h3><span class=m>${esc(p.shop)} · ${esc(p.category)}</span><p class=m>${esc(p.description)}</p><div class=pr><b>${inr(p.price)}</b>${p.stock?`<button class=b data-a=add data-id=${p._id}>Add to cart</button>`:"<span class=m>Sold out</span>"}</div></article>`).join("")||"<p class=m>No products found. Try another word or craft.</p>"}</div>`,
cart:()=>{const sub=S.cart.reduce((t,i)=>t+i.price*i.qty,0);return"<h1>Your cart</h1>"+(S.cart.length?S.cart.map(i=>`<div class=li><span>${esc(i.name)}<br><span class=m>${inr(i.price)}</span></span><span><button class=chip data-a=dec data-id=${i.id} aria-label="Less">−</button> ${i.qty} <button class=chip data-a=inc data-id=${i.id} aria-label="More">+</button> <button class=lnk data-a=rm data-id=${i.id}>Remove</button></span></div>`).join("")+`<p><b>Subtotal ${inr(sub)}</b><br><span class=m>Shipping ₹50, free above ₹999. The server confirms final prices and stock.</span></p>`+(S.user?`<form data-f=order><textarea name=address required minlength=10 placeholder="Name, phone and full delivery address"></textarea><button class=b>Place order (Cash on Delivery)</button></form>`:`<p>Please <button class=lnk data-a=nav data-id=auth>log in</button> to place your order.</p>`):"<p class=m>Your cart is empty.</p>")},
auth:()=>`<h1>Log in</h1><form data-f=login><input name=email type=email placeholder=Email required><input name=password type=password placeholder=Password required><button class=b>Log in</button></form>
<h2>Create account</h2><form data-f=register><input name=name placeholder="Full name" required><input name=email type=email placeholder=Email required><input name=phone placeholder="10-digit mobile" required><input name=password type=password minlength=8 placeholder="Password (8+ characters)" required><button class=b>Register</button></form>`,
orders:()=>`<h1>My orders</h1>${(S.d.orders||[]).map(o=>`<div class=box><b>${inr(o.total)}</b> · ${new Date(o.createdAt).toLocaleDateString()} · ${o.payment}<br>${o.items.map(i=>`${esc(i.name)} × ${i.qty} <span class=m>(${esc(i.shop)}: ${i.status})</span>`).join("<br>")}</div>`).join("")||"<p class=m>No orders yet.</p>"}`,
seller:()=>{const u=S.user;if(u.role==="customer")return`<h1>Become a seller</h1><p class=m>Tell us about your craft. An admin reviews every application.</p><form data-f=apply><input name=shop placeholder="Shop name" required><input name=district placeholder=District required><textarea name=story placeholder="Your artisan story" required minlength=10></textarea><button class=b>Apply</button></form>`;
 if(!u.seller.approved)return"<h1>Application received</h1><p>An admin is reviewing your shop. You can add products once approved.</p>";
 return`<h1>${esc(u.seller.shop)}</h1><h2>Add a product</h2><form data-f=product><input name=name placeholder="Product name" required><textarea name=description placeholder=Description required minlength=10></textarea><select name=category>${CATS.map(c=>`<option>${c}</option>`).join("")}</select><input name=price type=number min=1 placeholder="Price ₹" required><input name=stock type=number min=0 placeholder=Stock required><input name=image placeholder="Image link (https, optional)"><button class=b>Submit for approval</button></form>
 <h2>My products</h2>${(S.d.mine||[]).map(p=>`<div class=li><span>${esc(p.name)} · ${inr(p.price)} · stock ${p.stock}<br><span class=m>${p.approved?"Live":"Waiting for admin approval"}</span></span><button class=lnk data-a=arch data-id=${p._id}>Archive</button></div>`).join("")||"<p class=m>No products yet.</p>"}
 <h2>Orders to fulfil</h2>${(S.d.so||[]).map(o=>`<div class=box><span class=m>${esc(o.address)}</span>${o.items.map(i=>`<div class=li><span>${esc(i.name)} × ${i.qty}</span><select data-a=st data-id=${i._id}>${ST.map(s=>`<option ${s===i.status?"selected":""}>${s}</option>`).join("")}</select></div>`).join("")}</div>`).join("")||"<p class=m>No orders yet.</p>"}`},
admin:()=>{const a=S.d.a||{sellers:[],products:[]};return`<h1>Admin</h1><div class=box>${a.customers} customers · ${a.orders} orders · ${inr(a.gmv||0)} total sales</div>
<h2>Seller applications</h2>${a.sellers.map(x=>`<div class=li><span>${esc(x.seller.shop)} (${esc(x.name)}, ${esc(x.email)})<br><span class=m>${esc(x.seller.story)}</span></span><span><button class=b data-a=sap data-id=${x._id}>Approve</button> <button class=lnk data-a=srej data-id=${x._id}>Reject</button></span></div>`).join("")||"<p class=m>None pending.</p>"}
<h2>Product approvals</h2>${a.products.map(p=>`<div class=li><span>${esc(p.name)} · ${inr(p.price)} · ${esc(p.shop)}</span><span><button class=b data-a=pap data-id=${p._id}>Approve</button> <button class=lnk data-a=prej data-id=${p._id}>Reject</button></span></div>`).join("")||"<p class=m>None pending.</p>"}`}};
function draw(){const u=S.user,n=S.cart.reduce((t,i)=>t+i.qty,0);
 $("#nav").innerHTML=`<a class=logo href=# data-a=nav data-id=shop>KalaKart</a><button class=chip data-a=nav data-id=shop>Shop</button><button class=chip data-a=nav data-id=cart>Cart (${n})</button>`+(u?`${u.role!=="admin"?`<button class=chip data-a=nav data-id=orders>Orders</button><button class=chip data-a=nav data-id=seller>${u.role==="seller"?"Seller dashboard":"Sell"}</button>`:`<button class=chip data-a=nav data-id=admin>Admin</button>`}<button class=chip data-a=out>Log out (${esc(u.name.split(" ")[0])})</button>`:`<button class=chip data-a=nav data-id=auth>Log in</button>`);
 $("#app").innerHTML=V[S.view]()}
document.addEventListener("click",async e=>{const el=e.target.closest("[data-a]");if(!el)return;e.preventDefault();const a=el.dataset.a,id=el.dataset.id;try{
 if(a==="nav")return go(id==="orders"||id==="seller"||id==="admin"?(S.user?id:"auth"):id);
 if(a==="cat"){S.cat=id;return go("shop")}
 if(a==="add"){const p=S.d.products.find(x=>x._id===id),c=S.cart.find(x=>x.id===id);c?c.qty++:S.cart.push({id,name:p.name,price:p.price,qty:1});save();toast("Added to cart");return draw()}
 if(a==="inc"||a==="dec"||a==="rm"){const c=S.cart.find(x=>x.id===id);if(a==="inc")c.qty++;if(a==="dec")c.qty--;S.cart=S.cart.filter(x=>x.qty>0&&!(a==="rm"&&x.id===id));save();return draw()}
 if(a==="out"){await api("/logout","POST");S.user=null;return go("shop")}
 if(a==="arch"){await api("/seller/products/"+id,"DELETE");toast("Archived");return go("seller")}
 if(a==="sap"||a==="srej"){await api("/admin/sellers/"+id,"PATCH",{approve:a==="sap"});return go("admin")}
 if(a==="pap"||a==="prej"){await api("/admin/products/"+id,"PATCH",{approve:a==="pap"});return go("admin")}
}catch(x){toast(x.message)}});
document.addEventListener("change",async e=>{if(e.target.dataset.a!=="st")return;try{await api("/seller/items/"+e.target.dataset.id,"PATCH",{status:e.target.value});toast("Status updated")}catch(x){toast(x.message)}});
document.addEventListener("submit",async e=>{e.preventDefault();const f=e.target.dataset.f,d=Object.fromEntries(new FormData(e.target));try{
 if(f==="search"){S.q=d.q;return go("shop")}
 if(f==="login"||f==="register"){S.user=(await api("/"+f,"POST",d)).user;toast("Welcome, "+S.user.name);return go("shop")}
 if(f==="order"){await api("/orders","POST",{address:d.address,items:S.cart.map(i=>({id:i.id,qty:i.qty}))});S.cart=[];save();toast("Order placed!");return go("orders")}
 if(f==="apply"){S.user=(await api("/seller/apply","POST",d)).user;return go("seller")}
 if(f==="product"){await api("/seller/products","POST",d);toast("Submitted for approval");return go("seller")}
}catch(x){toast(x.message)}});
(async()=>{try{S.user=(await api("/me")).user}catch{}go("shop")})();

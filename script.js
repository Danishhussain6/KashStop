// KashStop demo storefront. Replace the WhatsApp number below with the seller's number.
const WHATSAPP_NUMBER = "910000000000"; // Example placeholder: country code + number, digits only.

const products = [
  {id:1,name:"Kashmiri Mongra Saffron",category:"Saffron",price:499,unit:"1 g",emoji:"🌺",tag:"Valley favourite",bg:"#f0e1d0",description:"Aromatic crimson threads for special moments."},
  {id:2,name:"Kashmir Walnut Kernels",category:"Dry fruits",price:349,unit:"250 g",emoji:"🌰",tag:"Orchard pick",bg:"#e7e0d2",description:"Rich, earthy walnuts from local orchards."},
  {id:3,name:"Handwoven Pashmina Shawl",category:"Textiles",price:2499,unit:"1 piece",emoji:"🧣",tag:"Artisan craft",bg:"#e4e9df",description:"A timeless layer inspired by valley craft."},
  {id:4,name:"Papier-Mâché Keepsake",category:"Crafts",price:799,unit:"1 piece",emoji:"🎨",tag:"Hand painted",bg:"#ead9cf",description:"A colourful decorative piece made with care."},
  {id:5,name:"Golden Kashmiri Almonds",category:"Dry fruits",price:399,unit:"250 g",emoji:"🥜",tag:"Pantry staple",bg:"#eee5d4",description:"Crunchy almonds for everyday snacking."},
  {id:6,name:"Kahwa Tea Gift Set",category:"Saffron",price:599,unit:"1 set",emoji:"🍵",tag:"Gift-ready",bg:"#dce8dd",description:"A cosy tea-time set inspired by Kashmiri kahwa."},
  {id:7,name:"Walnut Wood Keepsake",category:"Crafts",price:1199,unit:"1 piece",emoji:"🪵",tag:"Made by hand",bg:"#e9ded0",description:"A warm wooden accent for your home."},
  {id:8,name:"Embroidered Wool Wrap",category:"Textiles",price:1399,unit:"1 piece",emoji:"🧵",tag:"Traditional detail",bg:"#e0e7e3",description:"A soft wrap with a traditional-inspired finish."}
];

let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("kashstop-cart") || "{}");

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

function rupees(value){ return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value); }
function saveCart(){ localStorage.setItem("kashstop-cart",JSON.stringify(cart)); }
function showToast(message){
  toast.textContent = message; toast.classList.add("show");
  window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(()=>toast.classList.remove("show"),2200);
}
function renderProducts(){
  const term = searchInput.value.trim().toLowerCase();
  const shown = products.filter(p => (activeCategory==="All" || p.category===activeCategory) &&
    [p.name,p.category,p.description].some(v=>v.toLowerCase().includes(term)));
  productGrid.innerHTML = shown.map(p=>`
    <article class="product-card">
      <div class="product-visual" style="--product-bg:${p.bg}">
        <span class="product-tag">${p.tag}</span><span class="product-emoji" aria-hidden="true">${p.emoji}</span>
        <button class="quick-add" data-add="${p.id}" aria-label="Add ${p.name} to basket">+</button>
      </div>
      <div class="product-info"><span class="product-category">${p.category} · ${p.unit}</span>
        <div class="product-name-row"><h3 class="product-name">${p.name}</h3><span class="product-price">${rupees(p.price)}</span></div>
        <p class="product-description">${p.description}</p>
      </div>
    </article>`).join("");
  document.getElementById("emptyState").hidden = shown.length>0;
}
function renderCart(){
  const entries = Object.entries(cart).filter(([id,qty])=>qty>0);
  const count = entries.reduce((sum,[id,qty])=>sum+qty,0);
  const total = entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartItems").innerHTML = entries.map(([id,qty])=>{
    const p=products.find(item=>item.id===Number(id));
    return `<div class="cart-row"><div class="cart-thumb">${p.emoji}</div><div><h3>${p.name}</h3><p>${rupees(p.price)} · ${p.unit}</p><div class="quantity-controls"><button data-change="${id}" data-delta="-1" aria-label="Remove one">−</button><span>${qty}</span><button data-change="${id}" data-delta="1" aria-label="Add one">+</button></div></div><span class="line-price">${rupees(p.price*qty)}</span></div>`;
  }).join("");
  document.getElementById("cartEmpty").hidden = count>0;
  document.getElementById("cartFooter").hidden = count===0;
  document.getElementById("cartTotal").textContent = rupees(total);
  saveCart();
}
function openCart(){cartDrawer.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");overlay.hidden=false;document.body.style.overflow="hidden";}
function closeCart(){cartDrawer.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");overlay.hidden=true;document.body.style.overflow="";}
function addToCart(id){cart[id]=(cart[id]||0)+1;renderCart();showToast("Added to your basket");}
document.getElementById("filters").addEventListener("click",e=>{
  const button=e.target.closest("[data-category]");if(!button)return;
  activeCategory=button.dataset.category;
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===button));
  renderProducts();
});
productGrid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(Number(b.dataset.add));});
searchInput.addEventListener("input",renderProducts);
document.getElementById("searchToggle").addEventListener("click",()=>{document.getElementById("shop").scrollIntoView({behavior:"smooth"});searchInput.focus();});
document.getElementById("cartOpen").addEventListener("click",openCart);
document.getElementById("cartClose").addEventListener("click",closeCart);
document.getElementById("continueShopping").addEventListener("click",()=>{closeCart();document.getElementById("shop").scrollIntoView({behavior:"smooth"});});
overlay.addEventListener("click",closeCart);
document.getElementById("cartItems").addEventListener("click",e=>{
  const b=e.target.closest("[data-change]");if(!b)return;
  const id=b.dataset.change;cart[id]=(cart[id]||0)+Number(b.dataset.delta);if(cart[id]<=0)delete cart[id];renderCart();
});
document.getElementById("checkoutButton").addEventListener("click",()=>{
  const entries=Object.entries(cart).filter(([id,qty])=>qty>0);
  if(!entries.length)return;
  const lines=entries.map(([id,qty])=>{const p=products.find(item=>item.id===Number(id));return `• ${p.name} (${p.unit}) x ${qty} — ${rupees(p.price*qty)}`;});
  const total=entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  const message=`Hello KashStop! I'd like to enquire about this order:\n\n${lines.join("\n")}\n\nEstimated total: ${rupees(total)}\n\nPlease confirm availability, delivery charges and payment options.`;
  if(WHATSAPP_NUMBER==="910000000000"){showToast("Set the seller's WhatsApp number in script.js first.");return;}
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
});
document.getElementById("vendorButton").addEventListener("click",e=>{
  e.preventDefault();
  const msg="Hello KashStop! I'm interested in listing my Kashmiri products on your marketplace. Please share the seller onboarding details.";
  if(WHATSAPP_NUMBER==="910000000000"){showToast("Set the seller's WhatsApp number in script.js first.");return;}
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer");
});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();

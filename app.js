// ====== STATE MANAGEMENT (localStorage-persisted, mirrors Zustand store) ======
const STORE_KEY = 'foodit-store';

function getDefaultCart() {
  return {
    items: [],
    subtotal: 0,
    tax: 0,
    deliveryFee: 45,
    discount: 0,
    tip: 0,
    totalRewardPoints: 0,
    appliedCoupon: null,
  };
}

function migrateLegacyCartItems() {
  try {
    const legacyRaw = localStorage.getItem('foodit-cart');
    if (!legacyRaw) return [];

    const legacyItems = JSON.parse(legacyRaw);
    if (!Array.isArray(legacyItems)) return [];

    const groupedItems = {};

    legacyItems.forEach((item) => {
      const itemId = item?.itemId || item?.id;
      if (!itemId) return;

      const unitPrice = Number(item.price) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const groupKey = `${itemId}::${unitPrice}`;

      if (!groupedItems[groupKey]) {
        groupedItems[groupKey] = {
          itemId,
          quantity: 0,
          selectedOptions: item.selectedOptions || {},
          price: unitPrice,
          name: item.name || '',
          image: item.image || '',
        };
      }

      groupedItems[groupKey].quantity += quantity;
    });

    return Object.values(groupedItems);
  } catch (e) {
    return [];
  }
}

function normalizeCart(rawCart) {
  const defaultCart = getDefaultCart();
  const legacyItems = migrateLegacyCartItems();
  const rawItems = Array.isArray(rawCart?.items) ? rawCart.items : [];
  const items = rawItems.length > 0 ? rawItems : legacyItems;

  const normalizedItems = items
    .filter((item) => item && item.itemId)
    .map((item) => ({
      itemId: item.itemId,
      quantity: Math.max(1, Number(item.quantity) || 1),
      selectedOptions: item.selectedOptions || {},
      price: Number(item.price) || 0,
      name: item.name || '',
      image: item.image || '',
    }));

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = subtotal >= 99 || subtotal === 0 ? 0 : 45;

  return {
    ...defaultCart,
    ...rawCart,
    items: normalizedItems,
    subtotal,
    tax,
    deliveryFee,
    discount: Number(rawCart?.discount) || 0,
    tip: Number(rawCart?.tip) || 0,
    totalRewardPoints: Math.floor(subtotal / 10),
    appliedCoupon: rawCart?.appliedCoupon || null,
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return null;
}

function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    selectedLocation: store.selectedLocation,
    cart: store.cart,
    orders: store.orders,
  }));

  const legacyCart = [];
  store.cart.items.forEach((cartItem) => {
    const menuItem = typeof menuItems !== 'undefined'
      ? menuItems.find((item) => item.id === cartItem.itemId)
      : null;

    for (let i = 0; i < cartItem.quantity; i += 1) {
      legacyCart.push(menuItem || {
        id: cartItem.itemId,
        itemId: cartItem.itemId,
        name: cartItem.name || '',
        image: cartItem.image || '',
        price: cartItem.price,
        selectedOptions: cartItem.selectedOptions || {},
      });
    }
  });

  localStorage.setItem('foodit-cart', JSON.stringify(legacyCart));
}

const saved = loadStore();
const store = {
  user: saved?.user || null,
  isAuthenticated: saved?.isAuthenticated || false,
  selectedLocation: saved?.selectedLocation || null,
  cart: normalizeCart(saved?.cart),
  orders: saved?.orders || [],
};

function recalcCart() {
  const c = store.cart;
  c.subtotal = c.items.reduce((s, i) => s + i.price * i.quantity, 0);
  c.tax = Math.round(c.subtotal * 0.05 * 100) / 100;
  c.deliveryFee = c.subtotal >= 99 ? 0 : 45;
  c.totalRewardPoints = Math.floor(c.subtotal / 10);
  saveStore();
}

function notifyCartUpdated() {
  updateAllCartCounts();
  document.dispatchEvent(new CustomEvent('cart:updated', {
    detail: { cart: store.cart }
  }));
}

function addToCart(itemId, qty = 1) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return;
  const existing = store.cart.items.find(i => i.itemId === itemId);
  if (existing) {
    existing.quantity += qty;
    existing.name = existing.name || item.name;
    existing.image = existing.image || item.image;
  } else {
    store.cart.items.push({
      itemId,
      quantity: qty,
      selectedOptions: {},
      price: Number(item.price) || 0,
      name: item.name,
      image: item.image,
    });
  }
  recalcCart();
  notifyCartUpdated();
  showToast(`Added ${item.name} to cart!`);
}

function removeFromCart(itemId) {
  store.cart.items = store.cart.items.filter(i => i.itemId !== itemId);
  recalcCart();
  notifyCartUpdated();
}

function updateCartQty(itemId, qty) {
  if (qty <= 0) { removeFromCart(itemId); return; }
  const item = store.cart.items.find(i => i.itemId === itemId);
  if (item) { item.quantity = qty; recalcCart(); notifyCartUpdated(); }
}

function clearCart() {
  store.cart = { items: [], subtotal: 0, tax: 0, deliveryFee: 45, discount: 0, tip: 0, totalRewardPoints: 0, appliedCoupon: null };
  saveStore();
  notifyCartUpdated();
}

function setTip(amount) { store.cart.tip = amount; saveStore(); }
function applyCoupon(code, discount) { store.cart.appliedCoupon = code; store.cart.discount = discount; saveStore(); }
function removeCoupon() { store.cart.appliedCoupon = null; store.cart.discount = 0; saveStore(); }
function calculateTotal() { return store.cart.subtotal + store.cart.tax + store.cart.deliveryFee + store.cart.tip - store.cart.discount; }

function setUser(userData) {
  store.user = userData;
  store.isAuthenticated = !!userData;
  saveStore();
}

function setSelectedLocation(loc) {
  store.selectedLocation = loc;
  saveStore();
}

function addOrder(order) {
  store.orders.unshift(order);
  clearCart();
  saveStore();
}

function getItemQty(itemId) {
  const ci = store.cart.items.find(i => i.itemId === itemId);
  return ci ? ci.quantity : 0;
}

// ====== UI HELPERS ======
function showToast(message) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function updateAllCartCounts() {
  document.querySelectorAll('.cart-count-badge').forEach(el => {
    const total = store.cart.items.reduce((s, i) => s + i.quantity, 0);
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ====== SVG ICON HELPERS ======
const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  cart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#16a34a" viewBox="0 0 24 24" stroke="#16a34a" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  minus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  history: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1021 12.1"/></svg>`,
  orders: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  help: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

// ====== SHARED COMPONENTS (HTML generators) ======
function renderHeader(activePage = '') {
  const cartTotal = store.cart.items.reduce((s, i) => s + i.quantity, 0);
  const userInitial = store.user?.name?.charAt(0) || '';

  return `
  <header class="app-header">
    <div class="inner">
      <a href="index.html" class="logo">
        <div class="logo-icon" style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;">🍕</div>
        <div class="brand">
          <span class="brand-name">FoodIt</span>
          <span class="brand-sub">Food Delivery</span>
        </div>
      </a>
      <div class="actions">
        <a href="cart.html" class="icon-btn cart-btn">${icons.cart}<span class="cart-count-badge" style="display:${cartTotal > 0 ? 'flex' : 'none'}">${cartTotal}</span></a>
        ${store.isAuthenticated
      ? `<a href="profile.html" class="avatar-btn">${userInitial}</a>`
      : `<a href="auth.html" class="icon-btn">${icons.user}</a>`
    }
      </div>
    </div>
  </header>`;
}

function renderBottomNav(activePage = 'home') {
  return `
  <nav class="bottom-nav">
    <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">${icons.home}<span>Menu</span></a>
    <a href="offers.html" class="${activePage === 'offers' ? 'active' : ''}">${icons.zap}<span>Offers</span></a>
  </nav>`;
}
// ====== THEME MANAGEMENT ======
function initTheme() {
    const savedTheme = localStorage.getItem('foodit-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('foodit-theme', 'light');
        showToast('Light mode activated 🌞');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('foodit-theme', 'dark');
        showToast('Dark mode activated 🌙');
    }
}

// Add theme toggle button to all pages
function addThemeToggle() {
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    `;
    toggleBtn.onclick = toggleTheme;
    document.body.appendChild(toggleBtn);
}

// ====== ITEM CUSTOMIZATION MODAL ======
let currentCustomizingItem = null;
let selectedOptions = {};
let addonsSelected = [];

function openCustomizeModal(item) {
    currentCustomizingItem = item;
    selectedOptions = {};
    addonsSelected = [];
    
    let optionsHtml = '';
    
    // Size options
    if (item.customizable && item.options) {
        item.options.forEach(opt => {
            if (opt.type === 'radio') {
                optionsHtml += `
                    <div class="option-group" style="margin-bottom:20px;">
                        <h4 style="margin-bottom:10px; font-weight:700;">${opt.name}</h4>
                        <div class="option-buttons" style="display:flex; gap:10px; flex-wrap:wrap;">
                            ${opt.choices.map(choice => `
                                <button class="option-btn" data-price="${choice.price}" style="padding:10px 20px; border:2px solid #e5e7eb; border-radius:12px; background:white; cursor:pointer; transition:all 0.2s;">
                                    ${choice.name} ${choice.price > 0 ? `(+₹${choice.price})` : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
    }
    
    // Spice level for non-veg
    if (!item.veg) {
        optionsHtml += `
            <div class="option-group" style="margin-bottom:20px;">
                <h4 style="margin-bottom:10px; font-weight:700;">🌶️ Spice Level</h4>
                <div class="option-buttons" style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="option-btn" data-spice="mild" data-price="0" style="padding:10px 20px; border:2px solid #e5e7eb; border-radius:12px; background:white; cursor:pointer;">Mild</button>
                    <button class="option-btn" data-spice="medium" data-price="0" style="padding:10px 20px; border:2px solid #e5e7eb; border-radius:12px; background:white; cursor:pointer;">Medium</button>
                    <button class="option-btn" data-spice="hot" data-price="0" style="padding:10px 20px; border:2px solid #e5e7eb; border-radius:12px; background:white; cursor:pointer;">Hot</button>
                    <button class="option-btn" data-spice="extra-hot" data-price="20" style="padding:10px 20px; border:2px solid #e5e7eb; border-radius:12px; background:white; cursor:pointer;">Extra Hot (+₹20)</button>
                </div>
            </div>
        `;
    }
    
    // Add-ons
    const addons = [
        { id: 'extra-cheese', name: '🧀 Extra Cheese', price: 30 },
        { id: 'extra-toppings', name: '🍕 Extra Toppings', price: 50 },
        { id: 'dip-sauce', name: '🥫 Dip Sauce', price: 20 }
    ];
    
    optionsHtml += `
        <div class="option-group" style="margin-bottom:20px;">
            <h4 style="margin-bottom:10px; font-weight:700;">➕ Add-ons</h4>
            ${addons.map(addon => `
                <div class="addon-item" data-price="${addon.price}" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;">
                    <span>${addon.name}</span>
                    <span style="color:#f97316; font-weight:700;">+₹${addon.price}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Create modal popup HTML
    const modalHTML = `
        <div id="customizeModalPopup" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
            <div style="background:white; border-radius:24px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,0.3); animation:slideUp 0.3s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 style="font-size:24px; font-weight:800; background:linear-gradient(135deg,#f97316,#ea580c); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Customize ${item.name}</h2>
                    <button onclick="closeCustomizePopup()" style="width:36px; height:36px; border-radius:50%; border:none; background:#f3f3f3; font-size:24px; cursor:pointer;">&times;</button>
                </div>
                <img src="${item.image}" style="width:100%; height:200px; object-fit:cover; border-radius:16px; margin-bottom:20px;">
                ${optionsHtml}
                <div style="background:linear-gradient(135deg,#f97316,#ea580c); padding:16px; border-radius:16px; text-align:center; margin:20px 0;">
                    <span style="font-size:24px; font-weight:800; color:white;">Total: ₹<span id="popupTotalPrice">${item.price}</span></span>
                </div>
                <button onclick="addCustomizedToCartPopup()" style="width:100%; padding:16px; background:linear-gradient(135deg,#f97316,#ea580c); color:white; border:none; border-radius:16px; font-weight:800; font-size:16px; cursor:pointer; transition:transform 0.2s;">🛒 Add to Cart</button>
            </div>
        </div>
        <style>
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        </style>
    `;
    
    // Remove existing popup if any
    const existingPopup = document.getElementById('customizeModalPopup');
    if (existingPopup) existingPopup.remove();
    
    // Add popup to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Attach event listeners
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const parent = btn.closest('.option-group');
            parent.querySelectorAll('.option-btn').forEach(b => b.style.background = 'white');
            parent.querySelectorAll('.option-btn').forEach(b => b.style.borderColor = '#e5e7eb');
            btn.style.background = '#f97316';
            btn.style.borderColor = '#f97316';
            btn.style.color = 'white';
            updatePopupTotal();
        };
    });
    
    document.querySelectorAll('.addon-item').forEach(addon => {
        addon.onclick = () => {
            addon.classList.toggle('selected');
            if (addon.classList.contains('selected')) {
                addon.style.background = '#fff7ed';
                addon.style.borderColor = '#f97316';
            } else {
                addon.style.background = 'white';
                addon.style.borderColor = '#e5e7eb';
            }
            updatePopupTotal();
        };
    });
    
    updatePopupTotal();
}

function updatePopupTotal() {
    if (!currentCustomizingItem) return;
    
    let total = currentCustomizingItem.price;
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        if (btn.style.background === 'rgb(249, 115, 22)' || btn.style.background === '#f97316') {
            const price = parseInt(btn.dataset.price);
            if (price) total += price;
        }
    });
    
    document.querySelectorAll('.addon-item.selected').forEach(addon => {
        const price = parseInt(addon.dataset.price);
        if (price) total += price;
    });
    
    const totalSpan = document.getElementById('popupTotalPrice');
    if (totalSpan) totalSpan.textContent = total;
}

function addCustomizedToCartPopup() {
    if (!currentCustomizingItem) return;
    
    let totalPrice = currentCustomizingItem.price;
    const customizationDetails = [];
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        if (btn.style.background === 'rgb(249, 115, 22)' || btn.style.background === '#f97316') {
            const price = parseInt(btn.dataset.price);
            if (price) totalPrice += price;
            customizationDetails.push(btn.textContent.trim());
        }
    });
    
    const selectedAddons = [];
    document.querySelectorAll('.addon-item.selected').forEach(addon => {
        const price = parseInt(addon.dataset.price);
        if (price) totalPrice += price;
        selectedAddons.push(addon.querySelector('span:first-child').textContent);
    });
    
    if (selectedAddons.length) {
        customizationDetails.push(`Add-ons: ${selectedAddons.join(', ')}`);
    }
    
    const cartItem = {
        itemId: currentCustomizingItem.id,
        quantity: 1,
        selectedOptions: { customizations: customizationDetails.join(' | ') },
        price: totalPrice,
        name: currentCustomizingItem.name,
        image: currentCustomizingItem.image,
        basePrice: currentCustomizingItem.price
    };
    
    store.cart.items.push(cartItem);
    recalcCart();
    notifyCartUpdated();
    closeCustomizePopup();
    showToast(`✓ Added ${currentCustomizingItem.name} to cart!`);
}

function closeCustomizePopup() {
    const popup = document.getElementById('customizeModalPopup');
    if (popup) popup.remove();
}

function updateCustomizedTotal() {
    if (!currentCustomizingItem) return;
    
    let total = currentCustomizingItem.price;
    
    // Add size/option prices
    document.querySelectorAll('.option-btn.selected').forEach(btn => {
        const price = parseInt(btn.dataset.price);
        if (price) total += price;
    });
    
    // Add spice level extra
    const spiceBtn = document.querySelector('[data-spice="extra-hot"].selected');
    if (spiceBtn) total += 20;
    
    // Add add-ons
    document.querySelectorAll('.addon-item.selected').forEach(addon => {
        const price = parseInt(addon.dataset.addonPrice);
        if (price) total += price;
    });
    
    document.getElementById('customize-total-price').textContent = `Total: ₹${total}`;
}

function addCustomizedToCart() {
    if (!currentCustomizingItem) return;
    
    let totalPrice = currentCustomizingItem.price;
    const customizationDetails = [];
    
    // Get selected options
    document.querySelectorAll('.option-btn.selected').forEach(btn => {
        const price = parseInt(btn.dataset.price);
        if (price) totalPrice += price;
        customizationDetails.push(btn.textContent);
    });
    
    // Get spice level
    const spiceBtn = document.querySelector('[data-spice].selected');
    if (spiceBtn) {
        if (spiceBtn.dataset.spice === 'extra-hot') totalPrice += 20;
        customizationDetails.push(`Spice: ${spiceBtn.textContent}`);
    }
    
    // Get add-ons
    const selectedAddons = [];
    document.querySelectorAll('.addon-item.selected').forEach(addon => {
        const price = parseInt(addon.dataset.addonPrice);
        if (price) totalPrice += price;
        selectedAddons.push(addon.querySelector('span:first-child').textContent);
    });
    
    if (selectedAddons.length) {
        customizationDetails.push(`Add-ons: ${selectedAddons.join(', ')}`);
    }
    
    // Add to cart with customizations
    const cartItem = {
        itemId: currentCustomizingItem.id,
        quantity: 1,
        selectedOptions: { customizations: customizationDetails.join(' | ') },
        price: totalPrice,
        name: currentCustomizingItem.name,
        image: currentCustomizingItem.image,
        basePrice: currentCustomizingItem.price
    };
    
    store.cart.items.push(cartItem);
    recalcCart();
    notifyCartUpdated();
    closeCustomizeModal();
    showToast(`Added ${currentCustomizingItem.name} with customizations to cart!`);
}

function closeCustomizeModal() {
    const modal = document.getElementById('customize-modal');
    if (modal) modal.classList.add('hidden');
}

// Override the existing addToCart function to show modal for customizable items
const originalAddToCart = addToCart;
window.addToCart = function(itemId, qty = 1) {
    const item = menuItems.find(i => i.id === itemId);
    if (item && item.customizable) {
        openCustomizeModal(item);
    } else {
        originalAddToCart(itemId, qty);
    }
};

// Call initTheme on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    addThemeToggle();
    saveStore();
    updateAllCartCounts();
    
    // Create modal container if not exists
    if (!document.getElementById('customize-modal')) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'customize-modal';
        modalDiv.className = 'customize-modal hidden';
        modalDiv.innerHTML = '<div class="customize-content" id="customize-content"></div>';
        document.body.appendChild(modalDiv);
    }
}); 
function renderMenuCard(item) {
  const qty = getItemQty(item.id);
  return `
  <div class="card-3d fade-in-up" style="border-radius:16px;overflow:hidden;background:white;border:1px solid #f3f3f3;">
    <div style="position:relative;height:192px;overflow:hidden;background:#f5f5f5;">
      <img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.3),transparent);opacity:0;transition:opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'"></div>
      <div style="position:absolute;top:12px;left:12px;display:flex;gap:8px;flex-wrap:wrap;">
        ${item.isBestseller ? '<span class="badge badge-red animate-pulse">⭐ Bestseller</span>' : ''}
        ${item.isNew ? '<span class="badge badge-green">🆕 New</span>' : ''}
      </div>
      <div style="position:absolute;top:12px;right:12px;">
        ${item.veg ? '<div class="veg-indicator"><div class="dot"></div></div>' : '<div class="nonveg-indicator"><div class="dot"></div></div>'}
      </div>
      ${item.originalPrice ? `<div style="position:absolute;bottom:12px;left:12px;background:#ea580c;color:white;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;">Save ₹${item.originalPrice - item.price}</div>` : ''}
    </div>
    <div style="padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;margin-bottom:8px;">
        <h3 style="font-weight:700;font-size:14px;color:#111;">${item.name}</h3>
        <div style="display:flex;align-items:center;gap:4px;background:#f0fdf4;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;">
          ${icons.star}<span style="color:#15803d;">${item.rating}</span>
        </div>
      </div>
      <p style="font-size:12px;color:#6b7280;margin-bottom:4px;">⏱️ ${item.prepTime}-${item.prepTime + 10} mins</p>
      <p class="line-clamp-2" style="font-size:12px;color:#6b7280;margin-bottom:12px;">${item.description}</p>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;padding-top:12px;border-top:1px solid #f3f3f3;">
        <div>
          <span style="font-weight:700;font-size:18px;color:#111;">₹${item.price}</span>
          ${item.originalPrice ? `<br><span style="font-size:12px;color:#9ca3af;text-decoration:line-through;">₹${item.originalPrice}</span>` : ''}
        </div>
        ${qty === 0
      ? `<button class="btn btn-primary btn-sm" onclick="addToCart('${item.id}')">${icons.plus} Add</button>`
      : `<div style="display:flex;align-items:center;gap:8px;background:#ea580c;color:white;border-radius:10px;padding:4px 8px;">
              <button onclick="updateCartQty('${item.id}',${qty - 1})" style="padding:4px;color:white;">${icons.minus}</button>
              <span style="width:24px;text-align:center;font-weight:700;font-size:14px;">${qty}</span>
              <button onclick="updateCartQty('${item.id}',${qty + 1})" style="padding:4px;color:white;">${icons.plus}</button>
            </div>`
    }
      </div>
    </div>
  </div>`;
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  saveStore();
  updateAllCartCounts();
});

// Mock Data
const cuisines = [
    { id: "italian", name: "Italian", image: "https://www.google.com/imgres?q=food%20italian%20cuisine&imgurl=https%3A%2F%2Frestaurantindia.s3.ap-south-1.amazonaws.com%2Fs3fs-public%2Fcontent10735.jpg&imgrefurl=https%3A%2F%2Fwww.restaurantindia.in%2Farticle%2Fhow-italian-food-is-marking-its-presence-in-india.10735&docid=OxlRE5boJA7Z7M&tbnid=huEEe7uDkWmpcM&vet=12ahUKEwiHv_Oe586TAxVkd2wGHd9PB2IQnPAOegQIGhAB..i&w=1000&h=562&hcb=2&ved=2ahUKEwiHv_Oe586TAxVkd2wGHd9PB2IQnPAOegQIGhAB", description: "Authentic Italian cuisine" },
    { id: "chinese", name: "Chinese", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR76dzfRW6VjXWfQlgAGxMxwew2A3JQFbC-YQ&s", description: "Delicious Chinese dishes" },
    { id: "indian", name: "Indian", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQynKAtD1jF4MElJGeQiXp9IxgDkrY8Z7tKA&s", description: "Spicy Indian flavors" },
    { id: "mexican", name: "Mexican", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop", description: "Bold Mexican tastes" },
    { id: "thai", name: "Thai", image: "https://images.unsplash.com/photo-1476124369162-f4978f0c0ecf?w=400&h=400&fit=crop", description: "Aromatic Thai cuisine" }
];

const menuItems = [
    // ITALIAN
    { id: "pizza-margherita", name: "Margherita", cuisine: "Italian", description: "Classic pizza with fresh mozzarella, basil & tomatoes", price: 299, originalPrice: 399, rating: 4.8, image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=500&fit=crop", isBestseller: true, veg: true },
    { id: "pizza-pepperoni", name: "Pepperoni Delight", cuisine: "Italian", description: "Loaded with pepperoni slices & mozzarella cheese", price: 349, originalPrice: 449, rating: 4.7, image: "https://images.unsplash.com/photo-1628840042765-356cda07f757?w=500&h=500&fit=crop", isBestseller: true, veg: false },
    { id: "pasta-carbonara", name: "Carbonara Pasta", cuisine: "Italian", description: "Creamy pasta with bacon and parmesan", price: 320, originalPrice: 380, rating: 4.5, image: "https://images.unsplash.com/photo-1612874742237-6526221fcf4d?w=500&h=500&fit=crop", isBestseller: false, veg: false },

    // INDIAN
    { id: "biryani-chicken", name: "Chicken Biryani", cuisine: "Indian", description: "Aromatic basmati rice with tender chicken pieces", price: 289, originalPrice: 369, rating: 4.8, image: "https://images.unsplash.com/photo-1584599810694-65d22a2c4880?w=500&h=500&fit=crop", isBestseller: true, veg: false },
    { id: "paneer-tikka", name: "Paneer Tikka", cuisine: "Indian", description: "Grilled cottage cheese marinated in spices", price: 240, originalPrice: 300, rating: 4.6, image: "https://images.unsplash.com/photo-1567184109191-3783bcca27fa?w=500&h=500&fit=crop", isBestseller: true, veg: true },
    { id: "butter-chicken", name: "Butter Chicken", cuisine: "Indian", description: "Creamy tomato based curry with tender chicken", price: 350, originalPrice: 420, rating: 4.9, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=500&fit=crop", isBestseller: false, veg: false },

    // CHINESE
    { id: "noodles-hakka", name: "Hakka Noodles", cuisine: "Chinese", description: "Stir-fried noodles with vegetables & soy sauce", price: 229, originalPrice: 299, rating: 4.6, image: "https://images.unsplash.com/photo-1585518419759-3a3882e9e3ce?w=500&h=500&fit=crop", isBestseller: true, veg: true },
    { id: "dim-sum-veg", name: "Veg Dim Sums", cuisine: "Chinese", description: "Steamed vegetable dumplings (6 pieces)", price: 180, originalPrice: 220, rating: 4.4, image: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?w=500&h=500&fit=crop", isBestseller: false, veg: true },
    { id: "manchurian-chicken", name: "Chicken Manchurian", cuisine: "Chinese", description: "Deep fried chicken balls in tangy soy sauce", price: 260, originalPrice: 310, rating: 4.5, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=500&fit=crop", isBestseller: true, veg: false },

    // MEXICAN
    { id: "taco-beef", name: "Beef Tacos", cuisine: "Mexican", description: "Soft corn tortillas with seasoned beef and salsa", price: 250, originalPrice: 320, rating: 4.7, image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=500&h=500&fit=crop", isBestseller: true, veg: false },
    { id: "nachos-supreme", name: "Nachos Supreme", cuisine: "Mexican", description: "Loaded nachos with cheese, jalapenos and sour cream", price: 199, originalPrice: 250, rating: 4.3, image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=500&fit=crop", isBestseller: false, veg: true },

    // THAI
    { id: "pad-thai", name: "Pad Thai", cuisine: "Thai", description: "Stir-fried rice noodles with shrimp, tofu and peanuts", price: 280, originalPrice: 350, rating: 4.8, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&h=500&fit=crop", isBestseller: true, veg: false },
    { id: "green-curry-veg", name: "Thai Green Curry", cuisine: "Thai", description: "Aromatic green curry with vegetables and coconut milk", price: 310, originalPrice: 390, rating: 4.6, image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&h=500&fit=crop", isBestseller: false, veg: true }
];

// State Management (Simple)
let cart = JSON.parse(localStorage.getItem('foodit-cart')) || [];
let user = JSON.parse(localStorage.getItem('foodit-user')) || null;

// Utility Functions
function saveCart() {
    localStorage.setItem('foodit-cart', JSON.stringify(cart));
    updateCartIcon();
}

function updateCartIcon() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        cart.push(item);
        saveCart();
        showToast(`Added ${item.name} to cart!`);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 fade-in-up';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Page Specific Rendering
function renderHome() {
    const cuisineGrid = document.getElementById('cuisine-grid');
    if (cuisineGrid) {
        cuisines.forEach((cuisine, idx) => {
            const card = document.createElement('a');
            card.href = `cuisine.html?id=${cuisine.id}`;
            card.className = 'flex flex-col items-center gap-3 group fade-in-up';
            card.style.animationDelay = `${idx * 75}ms`;
            card.innerHTML = `
                <div class="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-lg card-3d group-hover:glow-animation">
                    <img src="${cuisine.image}" alt="${cuisine.name}" class="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/60 transition-all duration-300"></div>
                </div>
                <div class="text-center group-hover:scale-105 smooth-transition">
                    <p class="font-bold text-gray-900 text-sm md:text-base group-hover:text-orange-600">${cuisine.name}</p>
                </div>
            `;
            cuisineGrid.appendChild(card);
        });
    }

    const bestsellerGrid = document.getElementById('bestseller-grid');
    if (bestsellerGrid) {
        menuItems.filter(item => item.isBestseller).forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl shadow-md overflow-hidden card-3d border border-gray-100';
            card.innerHTML = `
                <div class="relative h-40">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                    ${item.veg ? '<span class="absolute top-2 left-2 bg-white p-1 rounded-sm border border-green-500"><div class="w-2 h-2 bg-green-500 rounded-full"></div></span>' : '<span class="absolute top-2 left-2 bg-white p-1 rounded-sm border border-red-500"><div class="w-2 h-2 bg-red-500 rounded-full"></div></span>'}
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-gray-900">${item.name}</h3>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.description}</p>
                    <div class="flex items-center justify-between mt-4">
                        <span class="font-bold text-orange-600">₹${item.price}</span>
                        <button onclick="addToCart('${item.id}')" class="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-lg font-bold hover:bg-orange-600 hover:text-white transition-colors">Add</button>
                    </div>
                </div>
            `;
            bestsellerGrid.appendChild(card);
        });
    }
}

function renderCuisinePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const cuisineId = urlParams.get('id');
    const cuisine = cuisines.find(c => c.id === cuisineId);

    if (cuisine) {
        document.getElementById('cuisine-name').textContent = cuisine.name;
        document.getElementById('cuisine-desc').textContent = cuisine.description;
        document.getElementById('hero-img').src = cuisine.image;

        const grid = document.getElementById('menu-grid');
        menuItems.filter(item => item.cuisine.toLowerCase() === cuisine.name.toLowerCase()).forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 card-3d';
            card.innerHTML = `
                <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <div>
                            ${item.veg ? '<span class="text-[10px] text-green-600 font-bold">VEG</span>' : '<span class="text-[10px] text-red-600 font-bold">NON-VEG</span>'}
                            <h3 class="font-bold text-gray-900">${item.name}</h3>
                        </div>
                        <span class="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded font-bold">★ ${item.rating}</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">₹${item.price}</p>
                    <button onclick="addToCart('${item.id}')" class="mt-3 w-full py-2 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-600 hover:text-white transition-all text-sm">Add to Plate</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Auth Logic
async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const btn = event.target.querySelector('button');
    btn.textContent = "Authenticating...";
    btn.disabled = true;

    setTimeout(() => {
        localStorage.setItem('foodit-user', JSON.stringify({ email, name: email.split('@')[0] }));
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        renderHome();
    } else if (window.location.pathname.includes('cuisine.html')) {
        renderCuisinePage();
    }
});

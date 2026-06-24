const Cart = (() => {
  const KEY = 'fan_cart';

  const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = (items) => { localStorage.setItem(KEY, JSON.stringify(items)); update(); };

  const add = (product) => {
    const items = load();
    const idx = items.findIndex(i => i.productId === product._id);
    if (idx > -1) {
      items[idx].quantity += 1;
    } else {
      items.push({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0] || '', quantity: 1 });
    }
    save(items);
    showToast(`${product.name} added to cart`, 'success');
  };

  const remove = (productId) => { save(load().filter(i => i.productId !== productId)); };

  const setQty = (productId, qty) => {
    if (qty < 1) { remove(productId); return; }
    const items = load();
    const idx = items.findIndex(i => i.productId === productId);
    if (idx > -1) { items[idx].quantity = qty; save(items); }
  };

  const clear = () => save([]);

  const total = () => load().reduce((s, i) => s + i.price * i.quantity, 0);
  const count = () => load().reduce((s, i) => s + i.quantity, 0);

  const update = () => {
    const cnt = count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = cnt;
      el.style.display = cnt ? 'flex' : 'none';
    });
    renderSidebar();
  };

  const renderSidebar = () => {
    const el = document.getElementById('cart-items');
    if (!el) return;
    const items = load();
    if (!items.length) {
      el.innerHTML = '<div class="empty-state"><h3>Your cart is empty</h3></div>';
    } else {
      el.innerHTML = items.map(i => `
        <div class="cart-item">
          <img class="cart-item-img" src="${i.image || '/img/placeholder.png'}" alt="${i.name}" onerror="this.src='/img/placeholder.png'">
          <div class="cart-item-info">
            <div class="cart-item-name">${i.name}</div>
            <div class="cart-item-price">$${(i.price * i.quantity).toFixed(2)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="Cart.setQty('${i.productId}', ${i.quantity - 1})">−</button>
              <span>${i.quantity}</span>
              <button class="qty-btn" onclick="Cart.setQty('${i.productId}', ${i.quantity + 1})">+</button>
              <button class="qty-btn" onclick="Cart.remove('${i.productId}')" style="margin-left:auto;color:#e94560">✕</button>
            </div>
          </div>
        </div>`).join('');
    }
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = '$' + total().toFixed(2);
  };

  const openSidebar = () => {
    document.getElementById('cart-overlay')?.classList.add('open');
    document.getElementById('cart-sidebar')?.classList.add('open');
  };
  const closeSidebar = () => {
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.getElementById('cart-sidebar')?.classList.remove('open');
  };

  document.addEventListener('DOMContentLoaded', update);

  return { add, remove, setQty, clear, total, count, load, openSidebar, closeSidebar };
})();

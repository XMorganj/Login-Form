const Auth = (() => {
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  };
  const getToken = () => localStorage.getItem('token');
  const isAdmin = () => getUser()?.role === 'admin';
  const isLoggedIn = () => !!getToken();

  const setSession = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const updateNavUI = () => {
    const user = getUser();
    const navActions = document.getElementById('nav-actions');
    if (!navActions) return;
    if (user) {
      navActions.innerHTML = `
        <span class="text-muted" style="font-size:0.85rem">Hi, ${user.name.split(' ')[0]}</span>
        ${user.role === 'fan' ? '<a href="/orders.html" class="btn btn-sm" style="background:var(--card-bg);border:1px solid var(--border)">My Orders</a>' : ''}
        ${user.role === 'admin' ? '<a href="/admin/" class="btn btn-outline btn-sm">Admin</a>' : ''}
        <button class="btn btn-sm" style="background:var(--card-bg);border:1px solid var(--border)" onclick="Auth.logout()">Logout</button>
      `;
    } else {
      navActions.innerHTML = `
        <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
        <a href="/register.html" class="btn btn-gold btn-sm">Sign Up</a>
      `;
    }
  };

  document.addEventListener('DOMContentLoaded', updateNavUI);

  return { getUser, getToken, isAdmin, isLoggedIn, setSession, logout };
})();

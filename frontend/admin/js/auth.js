document.addEventListener('DOMContentLoaded', () => {
  const loginOverlay = document.getElementById('login-overlay');
  const dashboardContainer = document.getElementById('dashboard-container');
  const loginForm = document.getElementById('login-form');
  const errorMsg = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  const showDashboard = () => {
    loginOverlay.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    // Trigger dashboard load
    window.dispatchEvent(new Event('app:loadDashboard'));
  };

  const showLogin = () => {
    loginOverlay.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  };

  // Check initial auth state
  if (window.api.token) {
    showDashboard();
  }

  // Handle Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      await window.api.login(username, password);
      showDashboard();
    } catch (error) {
      errorMsg.textContent = error.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    window.api.clearToken();
    showLogin();
    // Clear inputs
    document.getElementById('password').value = '';
  });

  // Handle Global Unauthorized Event
  window.addEventListener('auth:unauthorized', () => {
    showLogin();
  });
});

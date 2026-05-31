const API_BASE_URL = '/api';

class Api {
  constructor() {
    this.token = localStorage.getItem('saas_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('saas_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_dashboard_cache'); // Clear cached metrics on logout
  }

  async request(endpoint, options = {}) {
    const accessToken = localStorage.getItem('saas_token') || this.token;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid
          this.clearToken();
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        throw new Error(data.error || 'API Request Failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  async login(username, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getDashboard() {
    return this.request('/dashboard');
  }

  // SWR Helpers
  getCachedDashboard() {
    const cached = localStorage.getItem('saas_dashboard_cache');
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to read cached dashboard metrics:', e);
      return null;
    }
  }

  setCachedDashboard(data) {
    try {
      localStorage.setItem('saas_dashboard_cache', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to cache dashboard metrics:', e);
    }
  }
}

// Global API instance
window.api = new Api();

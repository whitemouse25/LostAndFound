import api from '../api/config';

const ADMIN_CREDENTIALS = {
  email: 'admin@laf.com',
  password: 'admin123'
};

// Generate a more realistic JWT token
const generateToken = (user) => {
  // Create a base64 encoded header
  const header = btoa(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  }));

  // Create a base64 encoded payload with a longer expiration (7 days)
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
  }));

  // In a real app, this would be signed with a secret key
  const signature = btoa('dummy-signature');

  return `${header}.${payload}.${signature}`;
};

// Login admin
export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store admin data and token
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    
    // Set the token in the API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Get admin user data
export const getAdminUser = () => {
  try {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = getAdminUser();
    
    if (!adminToken || !adminUser) {
      return false;
    }

    // Set the token in the API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    return true;
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return false;
  }
};

// Logout admin
export const logoutAdmin = () => {
  try {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error during logout:', error);
  }
}; 
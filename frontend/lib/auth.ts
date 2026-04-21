// Token save karo
export const saveToken = (token: string) => {
  localStorage.setItem('regulariq_token', token);
};

// Token lo
export const getToken = () => {
  return localStorage.getItem('regulariq_token');
};

// Token hatao (logout)
export const removeToken = () => {
  localStorage.removeItem('regulariq_token');
};

// Check karo login hai ya nahi
export const isLoggedIn = () => {
  return !!localStorage.getItem('regulariq_token');
};
const API_URL = process.env.NEXT_PUBLIC_API_URL;


// AUTH
export const signupUser = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};
// BUSINESS
export const saveOnboarding = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/business/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getBusiness = async (token: string) => {
  const res = await fetch(`${API_URL}/business/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};
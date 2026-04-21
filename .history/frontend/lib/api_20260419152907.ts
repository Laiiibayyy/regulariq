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
// Upload document
export const uploadDocument = async (
  formData: FormData,
  token: string
) => {
  const res = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

// Get documents
export const getDocuments = async (token: string) => {
  const res = await fetch(`${API_URL}/documents`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

// Delete document
export const deleteDocument = async (id: string, token: string) => {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

// Update document
export const updateDocument = async (
  id: string,
  data: any,
  token: string
) => {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getScore = async (token: string) => {
  const res = await fetch(`${API_URL}/score`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

export const recalculateScore = async (token: string) => {
  const res = await fetch(`${API_URL}/score/calculate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

// Get employees
export const getEmployees = async (token: string) => {
  const res = await fetch(`${API_URL}/employees`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

// Add employee
export const addEmployee = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Add certification
export const addCertification = async (
  employeeId: string,
  data: any,
  token: string
) => {
  const res = await fetch(`${API_URL}/employees/${employeeId}/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Delete employee
export const deleteEmployee = async (id: string, token: string) => {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

export const downloadAuditPDF = async (token: string) => {
  const res = await fetch(`${API_URL}/audit/export`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `regulariq-audit-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Get current user
export const getMe = async (token: string) => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

// Update profile
export const updateProfile = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Change password
export const changePassword = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Update business
export const updateBusiness = async (data: any, token: string) => {
  const res = await fetch(`${API_URL}/business/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
const API_URL = process.env.API_URL;

export async function loginService(username, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login gagal");
  }

  return await res.json(); // contoh: { token, user }
}

export function logoutService() {
  localStorage.removeItem("token");
}

const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.detail || `Request failed (${res.status})`);
  }
  return data;
}

async function request(path, { method = "GET", token, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  return parseResponse(response);
}

export function registerUser(body) {
  return request("/api/auth/register", { method: "POST", body });
}

export function loginUser(body) {
  return request("/api/auth/login", { method: "POST", body });
}

export function getCurrentUser(token) {
  return request("/api/auth/me", { token });
}

export function getProfile(token) {
  return request("/api/profile", { token });
}

export function putProfile(token, body) {
  return request("/api/profile", {
    method: "PUT",
    token,
    body,
  });
}

export function getPantry(token) {
  return request("/api/pantry", { token });
}

export function postPantry(token, body) {
  return request("/api/pantry", {
    method: "POST",
    token,
    body,
  });
}

export function patchPantry(token, id, body) {
  return request(`/api/pantry/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function deletePantry(token, id) {
  return request(`/api/pantry/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getPlan(token, date) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request(`/api/plans${q}`, { token });
}

export function postGeneratePlan(token, date, servingPeople) {
  return request("/api/plans/generate", {
    method: "POST",
    token,
    body: { date, servingPeople },
  });
}

export function patchMealComplete(token, date, slot, completed) {
  return request(`/api/plans/${encodeURIComponent(date)}/meal/${encodeURIComponent(slot)}`, {
    method: "PATCH",
    token,
    body: { completed },
  });
}

export function getDashboard(token, date) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request(`/api/dashboard${q}`, { token });
}

export function getHighlights(token) {
  return request("/api/highlights", { token });
}

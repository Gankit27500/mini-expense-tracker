const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message ?? "Request failed.");
    error.details = data.errors ?? {};
    throw error;
  }

  return data;
}

export const api = {
  getMeta: () => request("/meta"),
  getExpenses: (params) => request(`/expenses?${new URLSearchParams(cleanParams(params))}`),
  getSummary: () => request("/summary"),
  createExpense: (payload) => request("/expenses", { method: "POST", body: JSON.stringify(payload) }),
  updateExpense: (id, payload) => request(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" })
};

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== "All"));
}

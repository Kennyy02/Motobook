const adminServiceBaseURL =
  import.meta.env.VITE_ADMIN_SERVICE_URL || "http://localhost:3001";

export const login = async (username, password) => {
  const response = await fetch(
    // "/admin/login",
    `${adminServiceBaseURL}/admin/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Login failed");
  }

  return await response.json();
};

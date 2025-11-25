import axios from "axios";

export const getUserPreferences = async (userId) => {
  try {
    const response = await axios.get(`/preferences/${userId}`);
    console.log("getUserPreferences response:", response.data); // now logs actual data
    return response.data.categories || [];
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return [];
  }
};

export const saveUserPreferences = async (userId, categories) => {
  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

  await axios.post(`${userServiceBaseURL}/api/auth/preferences`, {
    userId,
    categories,
  });
};

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

import { auth } from "../firebase";

// Attach Firebase ID token to every request
API.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    // Get the JWT token from Firebase. 
    // This handles automatic token refresh in the background!
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

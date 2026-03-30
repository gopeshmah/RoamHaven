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
/* 
  1. CENTRALIZED API CLIENT: Creates a reusable Axios instance with a 
     pre-configured baseURL to simplify all backend communication.
  
  2. SECURITY INTERCEPTOR: Acts as a 'Security Gate' that automatically 
     pauses every outgoing request to verify the user's identity.
  
  3. DYNAMIC AUTHENTICATION: Retrieves the latest Firebase ID token and 
     attaches it as a 'Bearer' token in the Authorization header for 
     secure server-side verification.
*/

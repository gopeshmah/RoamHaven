import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Custom states for handling unverified users
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [unverifiedUserObj, setUnverifiedUserObj] = useState(null);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setErrors([]);
    setNeedsVerification(false);
    setResendMessage("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await API.post("/auth/sync", {
        firebaseUid: result.user.uid,
        email: result.user.email,
        firstName: result.user.displayName?.split(" ")[0] || "User",
      });
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setErrors([err.message || "Google Sign-In failed."]);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      if (unverifiedUserObj) {
        await sendEmailVerification(unverifiedUserObj);
        setResendMessage("Verification email resent! Check your inbox.");
      }
    } catch (err) {
      setResendMessage("Failed to resend. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setNeedsVerification(false);
    setResendMessage("");
    setLoading(true);
    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. CHECK EMAIL VERIFICATION
      if (!userCredential.user.emailVerified) {
        // Safe the full user object so we can trigger resendEmailVerification
        setUnverifiedUserObj(userCredential.user);
        
        // Force them out of the React session
        await signOut(auth);
        
        setNeedsVerification(true);
        setLoading(false);
        return;
      }
      
      // 3. Email is verified, proceed to sync with MongoDB
      const res = await API.post("/auth/sync", {
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email,
      });

      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      const message = err.code === "auth/invalid-credential" 
        ? "Invalid email or password. (Note: If you created this account with Google, please use the 'Sign in with Google' button above!)" 
        : err.message;
      setErrors([message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your RoamHaven account</p>
        </div>

        <div className="card p-8">
          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold text-gray-700 mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit}>
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                {errors.map((error, i) => <p key={i}>{error}</p>)}
              </div>
            )}
            
            {needsVerification && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl mb-6 text-sm">
                <p className="font-semibold mb-1">Email not verified</p>
                <p>Please check your inbox for the verification link.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-2 text-teal-600 hover:text-teal-700 font-semibold text-sm underline cursor-pointer"
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
                {resendMessage && <p className="mt-1 text-xs font-semibold">{resendMessage}</p>}
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">Forgot password?</Link>
              </div>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Sign In"}
            </button>

            <p className="text-center mt-6 text-gray-500 text-sm">
              Don't have an account? <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-semibold">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

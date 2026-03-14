import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "", userType: "guest",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleSignup = async () => {
    setErrors([]);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      const res = await API.post("/auth/sync", {
        firebaseUid: result.user.uid,
        email: result.user.email,
        firstName: result.user.displayName?.split(" ")[0] || "",
        lastName: result.user.displayName?.split(" ")[1] || "",
        userType: formData.userType,
      });
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setErrors([err.message || "Google Signup failed."]);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (formData.password !== formData.confirmPassword) {
      return setErrors(["Passwords do not match"]);
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Send the verification link to their email
      await sendEmailVerification(userCredential.user);

      // 3. Immediately sign them out so they are forced to verify first
      await signOut(auth);

      // 4. Sync MongoDB asynchronously in background (userType, names, etc.)
      await API.post("/auth/sync", {
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: formData.userType,
      });

      // Show success screen
      setVerifyMode(true);
    } catch (err) {
      const message = err.code === "auth/email-already-in-use" 
        ? "Email is already registered. Please sign in." 
        : err.message;
      setErrors([message]);
    } finally {
      setLoading(false);
    }
  };

  // Show "Check Email" screen if signup succeeded
  if (verifyMode) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-teal-600">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
            <p className="text-gray-500 mb-2">
              We've sent a verification link to <strong className="text-gray-700">{formData.email}</strong>
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Please click the link to activate your account before logging in.
            </p>
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold btn-primary px-6 py-2 rounded-xl text-white inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, return standard form
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join RoamHaven and start exploring</p>
        </div>

        <div className="card p-8">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold text-gray-700 mb-4 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center mb-4">
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

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="w-full px-4 py-3 rounded-xl input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="w-full px-4 py-3 rounded-xl input-field" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">I want to join as:</p>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.userType === 'guest' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  <input type="radio" name="userType" value="guest" checked={formData.userType === "guest"} onChange={handleChange} className="hidden" />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
                  <span className="text-sm font-semibold">Guest</span>
                </label>
                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.userType === 'host' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  <input type="radio" name="userType" value="host" checked={formData.userType === "host"} onChange={handleChange} className="hidden" />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.414V17a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H8a1 1 0 00-1 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-6.586a1 1 0 01.293-.707l7-7z" clipRule="evenodd" /></svg>
                  <span className="text-sm font-semibold">Host</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Create Account"}
            </button>

            <p className="text-center mt-6 text-gray-500 text-sm">
              Already have an account? <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus({ 
        type: "success", 
        message: "Password reset link sent! Please check your inbox to reset your password." 
      });
      setEmail(""); // clear input on success
    } catch (err) {
      const message = err.code === "auth/user-not-found" || err.code === "auth/invalid-email"
        ? "We couldn't find an account with that email address." 
        : err.message;
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-teal-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-500">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            
            {status.message && (
              <div className={`px-4 py-3 rounded-xl mb-6 text-sm border ${status.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <p className="font-semibold">{status.message}</p>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                className="w-full px-4 py-3 rounded-xl input-field" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full btn-primary py-3.5 rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                </svg>
                Back to Login
              </Link>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

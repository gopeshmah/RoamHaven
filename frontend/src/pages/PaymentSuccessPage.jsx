import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/axios";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const bookingId = searchParams.get("booking_id");
  const [status, setStatus] = useState(type === "razorpay" ? "success" : "processing");

  useEffect(() => {
    if (type === "razorpay") {
      setStatus("success");
      return;
    }
    if (sessionId && bookingId) {
      confirmPayment();
    } else {
      setStatus("error");
    }
  }, [sessionId, bookingId, type]);

  const confirmPayment = async () => {
    try {
      await API.post(`/bookings/${bookingId}/confirm-payment`, { sessionId });
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen px-4 py-20 bg-gray-50 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirming Payment...</h2>
            <p className="text-gray-500">Please do not close this window.</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="text-6xl mb-6 mx-auto">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-500 text-lg mb-8">
              Your booking is now confirmed. We are excited to host you!
            </p>
            <Link
              to="/bookings"
              className="btn-primary px-8 py-3.5 rounded-xl font-bold text-lg inline-block w-full text-white bg-teal-600 hover:bg-teal-700"
            >
              View My Trips
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6 mx-auto">❌</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-500 text-lg mb-8">
              We could not verify your payment. If you were charged, please contact support.
            </p>
            <Link
              to="/bookings"
              className="px-8 py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold text-lg inline-block w-full transition-colors"
            >
              Back to My Trips
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

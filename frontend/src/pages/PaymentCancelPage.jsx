import { Link } from "react-router-dom";

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen px-4 py-20 bg-gray-50 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6 mx-auto">⚠️</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h2>
        <p className="text-gray-500 text-lg mb-8">
          Your payment was cancelled and you have not been charged.
        </p>
        <Link
          to="/bookings"
          className="btn-primary px-8 py-3.5 rounded-xl font-bold text-lg inline-block w-full text-white bg-teal-600 hover:bg-teal-700"
        >
          Return to My Trips
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelPage;

import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center animate-fade-in-up">
        <div className="relative mb-8">
          <h1 className="text-[10rem] md:text-[14rem] font-black text-teal-100 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4 animate-float">🧭</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Lost your way?</h2>
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary px-8 py-4 rounded-2xl font-semibold inline-flex items-center gap-2 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.414V17a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H8a1 1 0 00-1 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-6.586a1 1 0 01.293-.707l7-7z" clipRule="evenodd" /></svg>
          Back to Haven
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

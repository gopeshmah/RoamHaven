const HomeCard = ({ home, children }) => {
  return (
    <div className="card overflow-hidden w-full max-w-sm group">
      <div className="relative overflow-hidden">
        <img
          src={home.photos && home.photos.length > 0 ? home.photos[0] : "/placeholder.jpg"}
          alt={home.houseName}
          className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400">
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-bold text-gray-800">{home.rating}</span>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full px-3 py-1.5 shadow-lg">
          <span className="text-sm font-bold text-white">₹{home.price}<span className="text-xs font-normal opacity-80"> /night</span></span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate group-hover:text-teal-600 transition-colors duration-300">
          {home.houseName}
        </h3>
        <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-teal-500">
            <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
          </svg>
          {home.location}
        </p>
        <div className="flex gap-2 flex-wrap">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HomeCard;

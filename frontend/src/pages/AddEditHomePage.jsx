import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";

const AddEditHomePage = () => {
  const { homeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!homeId;

  const [formData, setFormData] = useState({ houseName: "", price: "", location: "", description: "", maxGuests: "1" });
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to New Delhi
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState([]); // Array of File objects for newly selected photos
  const [existingPhotos, setExistingPhotos] = useState([]); // Array of strings (URLs) for existing photos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      API.get(`/homes/${homeId}`)
        .then((res) => {
          const h = res.data.home;
          setFormData({ houseName: h.houseName, price: h.price, location: h.location, description: h.description || "", maxGuests: h.maxGuests || "1" });
          if (h.coordinates?.lat && h.coordinates?.lng) {
            setCoordinates(h.coordinates);
            if (mapRef.current) mapRef.current.setView([h.coordinates.lat, h.coordinates.lng], 13);
          }
          if (h.photos && h.photos.length > 0) {
            setExistingPhotos(h.photos);
          } else if (h.photo) {
            setExistingPhotos([h.photo]);
          }
        })
        .catch(console.error);
    }
  }, [homeId, isEditing]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalPhotos = existingPhotos.length + photos.length + selectedFiles.length;
      
      if (totalPhotos > 5) {
        setError("Maximum 5 photos total allowed.");
        return;
      } else {
        setError("");
        setPhotos((prev) => [...prev, ...selectedFiles]); // Append new files instead of replacing
      }
    }
  };

  const removeNewPhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeExistingPhoto = (indexToRemove) => {
    setExistingPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setCoordinates(e.latlng);
        // Reverse geocode to get detailed address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
          .then(res => res.json())
          .then(data => {
             if (data.display_name) {
               // Get a more precise location string (e.g. neighborhood, city, state, country)
               const detailedAddress = data.display_name.split(",").slice(0, 4).join(",").trim();
               setFormData(prev => ({ ...prev, location: detailedAddress }));
             }
          })
          .catch(err => console.error("Reverse geocoding failed", err));
      },
    });

    return coordinates ? <Marker position={coordinates} /> : null;
  };

  const handleSearchLocation = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setCoordinates(newCoords);
        if (mapRef.current) mapRef.current.setView([newCoords.lat, newCoords.lng], 14);
        setFormData(prev => ({ ...prev, location: display_name.split(",").slice(0, 3).join(",") }));
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    // Show loading state on button (optional, keeping it simple with an alert for now if it takes time)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoordinates(newCoords);
        if (mapRef.current) mapRef.current.setView([latitude, longitude], 14);
        
        // Reverse geocode to get the detailed text format
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
             if (data.display_name) {
               const detailedAddress = data.display_name.split(",").slice(0, 4).join(",").trim();
               setFormData(prev => ({ ...prev, location: detailedAddress }));
             }
          })
          .catch(err => console.error("Reverse geocoding failed", err));
      },
      (error) => {
        toast.error("Unable to retrieve your location. Please check your browser permissions.");
        console.error("Geolocation error:", error);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    // Append coordinates as JSON string
    data.append("coordinates", JSON.stringify(coordinates));
    
    // Append existing photos to be retained
    if (existingPhotos.length > 0) {
      existingPhotos.forEach((photoUrl) => data.append("existingPhotos", photoUrl));
    }
    
    // Append new files
    if (photos.length > 0) {
      photos.forEach((file) => data.append("photos", file));
    }

    try {
      if (isEditing) {
        await API.put(`/host/edit-home/${homeId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await API.post("/host/add-home", data, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/host/homes");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{isEditing ? "Edit" : "Add"} Your Listing</h1>
          <p className="text-gray-500">Share your space on RoamHaven</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Name</label>
              <input type="text" name="houseName" value={formData.houseName} onChange={handleChange} placeholder="Cozy Mountain Cabin" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price / Night (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="2500" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Guests</label>
              <select name="maxGuests" value={formData.maxGuests} onChange={handleChange} className="w-full px-4 py-3 rounded-xl input-field cursor-pointer">
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Manali, Himachal Pradesh" className="w-full px-4 py-3 rounded-xl input-field" required />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Photos (Max 5 Total)
              </label>
              
              {/* File Input */}
              {existingPhotos.length + photos.length < 5 && (
                <input
                  type="file" name="photos" accept="image/jpg, image/jpeg, image/png" multiple
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-3 rounded-xl input-field file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 file:cursor-pointer mb-3"
                  {...(!isEditing && photos.length === 0 ? { required: true } : {})}
                />
              )}
              
              {/* Previews map */}
              {(photos.length > 0 || existingPhotos.length > 0) && (
                <div className="mt-2 flex gap-3 flex-wrap pb-2">
                  {/* Existing Photos */}
                  {existingPhotos.map((path, idx) => (
                    <div key={idx} className="relative group">
                      <img src={path || "/placeholder.jpg"} alt="existing" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />
                       <button
                        type="button"
                        onClick={() => removeExistingPhoto(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                      </button>
                    </div>
                  ))}
                  
                  {/* New Selected Photos */}
                  {photos.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-teal-200 shadow-sm" />
                      <div className="absolute inset-0 border-2 border-teal-500 rounded-xl pointer-events-none"></div>
                      <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded-md">New</span>
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                        title="Remove photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pin Location on Map</label>
              
              {/* Map Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a city, landmark, etc..."
                    className="flex-1 px-4 py-2.5 rounded-xl input-field text-sm"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="px-4 py-2.5 bg-gray-900 text-white font-medium rounded-xl text-sm hover:bg-gray-800 transition-colors"
                  >
                    Search
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="px-4 py-2.5 bg-teal-50 text-teal-700 font-semibold border border-teal-200 rounded-xl text-sm hover:bg-teal-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.983 14.828a4.992 4.992 0 001.649-2.126L16.207 5.09a.75.75 0 00-.997-.997l-7.612 2.574a4.992 4.992 0 00-2.126 1.65 1 1 0 00.225 1.418l2.058 1.528 1.528 2.058a1 1 0 001.418.225z" clipRule="evenodd" /></svg>
                  My Location
                </button>
              </div>

              <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner mb-2 z-0 relative">
                <MapContainer center={[coordinates.lat, coordinates.lng]} zoom={13} className="h-full w-full" ref={mapRef}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                  <LocationMarker />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 mb-4">The text location field above will auto-update when you drop a pin.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell travelers what makes your place special..." className="w-full px-4 py-3 rounded-xl input-field resize-none" rows={4} />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : isEditing ? "Update Listing" : "Publish Listing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditHomePage;

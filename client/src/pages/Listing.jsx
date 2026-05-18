import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDispatch, useSelector } from "react-redux";
import { setFavorites } from "../redux/user/userSlice";

import {
  FaBath,
  FaBed,
  FaChair,
  FaHeart,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaRegHeart,
  FaShare,
  FaRulerCombined,
} from "react-icons/fa";
import Contact from "../component/Contact";

// Fix Leaflet default marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [coords, setCoords] = useState(null);
  const [favPending, setFavPending] = useState(false);
  const params = useParams();
  SwiperCore.use([Navigation]);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const isFavorited = listing && currentUser?.favorites?.includes(listing._id);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setError(false);
        setNotFound(false);
        setLoading(true);
        const listingid = params.listingId;
        const res = await fetch(`/api/v1/listing/getListingbyId/${listingid}`);
        const data = await res.json();
        if (data.success === false) {
          if (data.statuscode === 404) {
            setNotFound(true);
          } else {
            setError(true);
          }
          setLoading(false);
          return;
        }
        setListing(data.data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  useEffect(() => {
    if (!listing?.address) return;
    const geocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.address)}&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch (_) {}
    };
    geocode();
  }, [listing?.address]);

  const handleFavoriteToggle = async () => {
    if (!currentUser) return;
    if (favPending) return;
    setFavPending(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/v1/user/favorites/${listing._id}`, { method });
      const data = await res.json();
      if (data.success !== false) dispatch(setFavorites(data.data));
    } catch (_) {}
    finally { setFavPending(false); }
  };

  const displayPrice = listing
    ? listing.offer ? listing.discountPrice : listing.regularPrice
    : 0;

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {notFound && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-center my-7 text-2xl text-slate-700">Listing not found</p>
          <a href="/" className="text-blue-700 hover:underline">Back to home</a>
        </div>
      )}
      {error && !notFound && (
        <p className="text-center my-7 text-2xl">Something went wrong. Please try again.</p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[450px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 flex flex-col gap-2">
            <div className="border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
              <FaShare
                className="text-slate-500"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              />
            </div>
            {currentUser && (
              <button
                onClick={handleFavoriteToggle}
                className="border rounded-full w-12 h-12 flex justify-center items-center bg-white shadow cursor-pointer hover:scale-110 transition-transform"
                title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                {isFavorited
                  ? <FaHeart className="text-red-500 text-xl" />
                  : <FaRegHeart className="text-gray-400 text-xl" />
                }
              </button>
            )}
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listing.name} - ${" "}
              {displayPrice.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </p>
            <p className="flex items-center mt-6 gap-2 text-slate-600  text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ${+listing.regularPrice - +listing.discountPrice} OFF
                </p>
              )}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              {listing.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1 ? `${listing.bedrooms} beds` : `${listing.bedrooms} bed`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1 ? `${listing.bathrooms} baths` : `${listing.bathrooms} bath`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
              {listing.area > 0 && (
                <li className="flex items-center gap-1 whitespace-nowrap">
                  <FaRulerCombined className="text-lg" />
                  {listing.area.toLocaleString()} sqft
                  {listing.area > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                      (${Math.round(displayPrice / listing.area).toLocaleString()}/sqft)
                    </span>
                  )}
                </li>
              )}
            </ul>

            {/* Map */}
            {coords && (
              <div className="mt-4">
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FaMapMarkedAlt className="text-green-700" /> Location
                </h3>
                <MapContainer
                  center={[coords.lat, coords.lng]}
                  zoom={15}
                  style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[coords.lat, coords.lng]}>
                    <Popup>{listing.address}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
              >
                Contact landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}

export default Listing;

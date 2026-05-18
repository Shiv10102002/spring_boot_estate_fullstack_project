import { Link, useNavigate } from "react-router-dom";
import {MdLocationOn} from 'react-icons/md';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFavorites } from '../redux/user/userSlice';

export default function ListingItem({listing}) {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const isFavorited = currentUser?.favorites?.includes(listing._id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/v1/user/favorites/${listing._id}`, { method });
      const data = await res.json();
      if (data.success !== false) {
        dispatch(setFavorites(data.data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px] relative">
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow hover:scale-110 transition-transform"
        title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        {isFavorited
          ? <FaHeart className="text-red-500 text-lg" />
          : <FaRegHeart className="text-gray-400 text-lg" />
        }
      </button>
      <Link to={`/listing/${listing._id}`}>
        <img
          src={
            (listing.imageUrls && listing.imageUrls[0]) ||
            "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg"
          }
          alt="listing cover"
          className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300"
        />
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="truncate text-lg font-semibold text-slate-700">
            {listing.name}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-green-700" />
            <p className="text-sm text-gray-600 truncate w-full">
              {listing.address}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          <p className="text-slate-500 mt-2 font-semibold ">
            $
            {listing.offer
              ? listing.discountPrice.toLocaleString("en-US")
              : listing.regularPrice.toLocaleString("en-US")}
            {listing.type === "rent" && " / month"}
          </p>
          <div className="text-slate-700 flex gap-4 flex-wrap">
            <div className="font-bold text-xs">
              {listing.bedrooms > 1 ? `${listing.bedrooms} beds` : `${listing.bedrooms} bed`}
            </div>
            <div className="font-bold text-xs">
              {listing.bathrooms > 1 ? `${listing.bathrooms} baths` : `${listing.bathrooms} bath`}
            </div>
            {listing.area > 0 && (
              <div className="font-bold text-xs text-gray-500">
                {listing.area.toLocaleString()} sqft
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

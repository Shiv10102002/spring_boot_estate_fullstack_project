import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { app } from "../firebase";

import {
  getStorage,
  uploadBytesResumable,
  ref,
  getDownloadURL,
} from "firebase/storage";

import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";

function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [fileperc, setFileperc] = useState(0);
  const [fileuploadError, setFileUploadError] = useState(false);
  const [formdata, setFormdata] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [listingError, setListingError] = useState(false);
  const [listingLoading, setListingLoading] = useState(false);
  const [userListing, setUserListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const dispatch = useDispatch();

  const handleFileupload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileperc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormdata({ ...formdata, avatar: downloadURL });
        });
      }
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/v1/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data.data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };
  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.id]: e.target.value });
  };
  const handleDeleteUSer = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/v1/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/v1/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess());
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleDeleteListing = async (listingid) => {
    try {
      const res = await fetch(`/api/v1/listing/delete/${listingid}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) return;
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingid)
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (file) handleFileupload(file);
  }, [file]);

  // Auto-load owner's listings
  useEffect(() => {
    if (currentUser?.role !== "OWNER") return;
    const fetchListings = async () => {
      try {
        setListingError(false);
        setListingLoading(true);
        const res = await fetch(`/api/v1/listing/listings/${currentUser._id}`);
        const data = await res.json();
        if (data.success === false) { setListingError(true); return; }
        setUserListings(data.data);
      } catch (error) {
        setListingError(true);
      } finally {
        setListingLoading(false);
      }
    };
    fetchListings();
  }, [currentUser?._id]);

  // Load saved/favorite listings
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setSavedLoading(true);
        const res = await fetch("/api/v1/user/favorites");
        const data = await res.json();
        if (data.success !== false) setSavedListings(data.data);
      } catch (_) {}
      finally { setSavedLoading(false); }
    };
    fetchSaved();
  }, []);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formdata.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer mt-2 self-center"
        />

        <p className="text-sm self-center">
          {fileuploadError ? (
            <span className="text-red-700">Error Image uploading</span>
          ) : fileperc > 0 && fileperc < 100 ? (
            <span>{`Uploading ${fileperc}%`}</span>
          ) : fileperc === 100 ? (
            <span className="text-green-700">Image Successfully Uploaded</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg "
          onChange={handleChange}
        />
        <input
          type="email"
          defaultValue={currentUser.email}
          placeholder="email"
          id="email"
          className="border p-3 rounded-lg "
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg "
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 uppercase rounded-lg text-white p-3 hover:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        {currentUser.role === "OWNER" && (
          <Link
            to={"/create-listing"}
            className="bg-green-700 p-3  rounded-lg  text-center uppercase text-white hover:opacity-90"
          >
            Create Listing
          </Link>
        )}
      </form>

      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUSer} className="text-red-700 cursor-pointer">
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>

      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully" : ""}
      </p>

      {/* Owner's Listings — auto-loaded */}
      {currentUser.role === "OWNER" && (
        <div className="mt-7">
          <h1 className="text-center text-2xl font-semibold mb-4">Your Listings</h1>
          {listingLoading && <p className="text-center text-slate-500">Loading listings...</p>}
          {listingError && <p className="text-red-700 text-center">Error loading listings</p>}
          {!listingLoading && !listingError && userListing.length === 0 && (
            <p className="text-center text-slate-500">You have no listings yet.</p>
          )}
          <div className="flex flex-col gap-4">
            {userListing.map((listing) => (
              <div
                key={listing._id}
                className="flex justify-between p-3 items-center gap-4 border rounded-lg"
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt="listing image"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                </Link>
                <Link
                  className="text-slate-700 font-semibold hover:underline truncate flex-1"
                  to={`/listing/${listing._id}`}
                >
                  <p>{listing.name}</p>
                </Link>
                <div className="flex flex-col justify-center items-center gap-1">
                  <button
                    onClick={() => handleDeleteListing(listing._id)}
                    className="text-red-700 font-semibold uppercase"
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className="text-green-700 font-semibold uppercase">Edit</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved / Wishlist Listings */}
      <div className="mt-7">
        <h1 className="text-center text-2xl font-semibold mb-4">Saved Listings</h1>
        {savedLoading && <p className="text-center text-slate-500">Loading saved listings...</p>}
        {!savedLoading && savedListings.length === 0 && (
          <p className="text-center text-slate-500">No saved listings yet. Click the ❤️ heart on any listing to save it.</p>
        )}
        <div className="flex flex-col gap-4">
          {savedListings.map((listing) => (
            <div
              key={listing._id}
              className="flex justify-between p-3 items-center gap-4 border rounded-lg"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="saved listing"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
                <p className="text-sm text-gray-500 font-normal">
                  ${listing.offer
                    ? listing.discountPrice.toLocaleString()
                    : listing.regularPrice.toLocaleString()}
                  {listing.type === "rent" && " / month"}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;

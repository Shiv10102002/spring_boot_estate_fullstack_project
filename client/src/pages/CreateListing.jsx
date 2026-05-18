import React, { useState } from "react";
import { app } from "../firebase";

import {
  ref,
  getDownloadURL,
  getStorage,
  uploadBytesResumable,
} from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bathrooms: 1,
    bedrooms: 1,
    regularPrice: 500,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
    area: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }
    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }
    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };
  const handleFileSubmit = (e) => {
    if (files.length === 0) {
      setImageUploadError("Please select at least one image");
      return;
    }
    if (files.length + formData.imageUrls.length > 6) {
      setImageUploadError("You can only upload 6 images per listing");
      return;
    }
    const oversizedFile = files.find((file) => file.size > 2 * 1024 * 1024);
    if (oversizedFile) {
      setImageUploadError(`"${oversizedFile.name}" exceeds 2MB limit`);
      return;
    }
    setUploading(true);
    setImageUploadError(false);
    const promises = files.map((file) => storeImage(file));
    Promise.all(promises)
      .then((urls) => {
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(urls),
        });
        setImageUploadError(false);
        setUploading(false);
      })
      .catch((err) => {
        setImageUploadError("Image upload failed. Check Firebase Storage rules.");
        setUploading(false);
      });
  };
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");

      setLoading(true);
      setError(false);
      const res = await fetch(`/api/v1/listing/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        return;
      }
      navigate(`/listing/${data.data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

 
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a listing
      </h1>
      <form
        onSubmit={handleFormSubmit}
        className="flex flext-col sm:flex-row gap-4"
      >
        <div className="flex flex-col gap-4 flex-1 ">
          <input
            type="text"
            placeholder="Name"
            className="outline-none border rounded-lg p-3 "
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="outline-none border rounded-lg p-3 "
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="outline-none border rounded-lg p-3 "
            id="address"
            onChange={handleChange}
            value={formData.address}
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking === true}
              />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished === true}
              />
              <span>Furnish</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer === true}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-grey-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-grey-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Bath</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="500"
                max="50000000"
                required
                className="p-3 border border-grey-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className=" flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs "> ($ / month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="50000000"
                  required
                  className="p-3 border border-grey-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className=" flex flex-col items-center">
                  <p>Discount Price</p>
                  <span className="text-xs "> ($ / month)</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="area"
                min="0"
                className="p-3 border border-grey-300 rounded-lg"
                onChange={handleChange}
                value={formData.area}
                placeholder="0"
              />
              <div className="flex flex-col items-center">
                <p>Area</p>
                <span className="text-xs">(sqft, optional)</span>
              </div>
            </div>
          </div>
        </div>
        <div className=" flex flex-col felx-1 gap-4">
          <p>
            Images:
            <span className=" font-normal text-gray-700">
              The first image will be the cover(max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="p-3 border  border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={handleFileSubmit}
              className="text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80 p-3"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="text-red-700 uppercase rounded-lg hover:opacity-65"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white uppercase rounded-lg hover:opacity-90"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>

          {error && <p className="text-red-700 text-sm">{error}</p>}

        </div>
      </form>
    </main>
  );
}

export default CreateListing;

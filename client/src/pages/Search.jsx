import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ListingItem from '../component/ListingItem';
import SkeletonCard from '../component/SkeletonCard';
import { MdSearchOff } from 'react-icons/md';

export default function Search() {
     const navigate = useNavigate();
     const location = useLocation();
     const [sidebardata, setSidebardata] = useState({
       searchTerm: "",
       type: "all",
       parking: false,
       furnished: false,
       offer: false,
       minPrice: "",
       maxPrice: "",
       sort: "createdAt",
       order: "desc",
     });

     const [loading, setLoading] = useState(false);
     const [listings, setListings] = useState([]);
     const [totalPages, setTotalPages] = useState(1);
     const [currentPage, setCurrentPage] = useState(0);
     const [total, setTotal] = useState(0);

     useEffect(() => {
       const urlParams = new URLSearchParams(location.search);
       const searchTermFromUrl = urlParams.get("searchTerm");
       const typeFromUrl = urlParams.get("type");
       const parkingFromUrl = urlParams.get("parking");
       const furnishedFromUrl = urlParams.get("furnished");
       const offerFromUrl = urlParams.get("offer");
       const sortFromUrl = urlParams.get("sort");
       const orderFromUrl = urlParams.get("order");
       const minPriceFromUrl = urlParams.get("minPrice");
       const maxPriceFromUrl = urlParams.get("maxPrice");
       const pageFromUrl = parseInt(urlParams.get("page") || "0", 10);

       if (
         searchTermFromUrl || typeFromUrl || parkingFromUrl ||
         furnishedFromUrl || offerFromUrl || sortFromUrl || orderFromUrl ||
         minPriceFromUrl || maxPriceFromUrl
       ) {
         setSidebardata({
           searchTerm: searchTermFromUrl || "",
           type: typeFromUrl || "all",
           parking: parkingFromUrl === "true",
           furnished: furnishedFromUrl === "true",
           offer: offerFromUrl === "true",
           minPrice: minPriceFromUrl || "",
           maxPrice: maxPriceFromUrl || "",
           sort: sortFromUrl || "createdAt",
           order: orderFromUrl || "desc",
         });
       }
       setCurrentPage(pageFromUrl);

       const fetchListings = async () => {
         try {
           setLoading(true);
           const searchQuery = urlParams.toString();
           const res = await fetch(`/api/v1/listing/getSearchListing?${searchQuery}`);
           const data = await res.json();
           if (data.success === false) { setLoading(false); return; }
           setListings(data.data.listings);
           setTotal(data.data.total);
           setTotalPages(data.data.totalPages);
           setLoading(false);
         } catch (error) {
           console.log(error);
           setLoading(false);
         }
       };
       fetchListings();
     }, [location.search]);

     const handleChange = (e) => {
       if (e.target.id === "all" || e.target.id === "rent" || e.target.id === "sale") {
         setSidebardata({ ...sidebardata, type: e.target.id });
       }
       if (e.target.id === "searchTerm") {
         setSidebardata({ ...sidebardata, searchTerm: e.target.value });
       }
       if (e.target.id === "parking" || e.target.id === "furnished" || e.target.id === "offer") {
         setSidebardata({ ...sidebardata, [e.target.id]: e.target.checked });
       }
       if (e.target.id === "sort_order") {
         const sort = e.target.value.split("_")[0] || "createdAt";
         const order = e.target.value.split("_")[1] || "desc";
         setSidebardata({ ...sidebardata, sort, order });
       }
       if (e.target.id === "minPrice" || e.target.id === "maxPrice") {
         setSidebardata({ ...sidebardata, [e.target.id]: e.target.value });
       }
     };

     const buildParams = (overrides = {}) => {
       const urlParams = new URLSearchParams();
       urlParams.set("searchTerm", sidebardata.searchTerm);
       urlParams.set("type", sidebardata.type);
       urlParams.set("parking", sidebardata.parking);
       urlParams.set("furnished", sidebardata.furnished);
       urlParams.set("offer", sidebardata.offer);
       if (sidebardata.minPrice !== "") urlParams.set("minPrice", sidebardata.minPrice);
       if (sidebardata.maxPrice !== "") urlParams.set("maxPrice", sidebardata.maxPrice);
       urlParams.set("sort", sidebardata.sort);
       urlParams.set("order", sidebardata.order);
       urlParams.set("page", overrides.page ?? 0);
       return urlParams.toString();
     };

     const handleSubmit = (e) => {
       e.preventDefault();
       navigate(`/search?${buildParams({ page: 0 })}`);
     };

     const goToPage = (page) => {
       navigate(`/search?${buildParams({ page })}`);
     };

     const pageNumbers = () => {
       const pages = [];
       const start = Math.max(0, currentPage - 2);
       const end = Math.min(totalPages - 1, currentPage + 2);
       for (let i = start; i <= end; i++) pages.push(i);
       return pages;
     };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7  border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Search Term:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            <div className="flex gap-2">
              <input type="checkbox" id="all" className="w-5" onChange={handleChange} checked={sidebardata.type === "all"} />
              <span>Rent & Sale</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" onChange={handleChange} checked={sidebardata.type === "rent"} />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" onChange={handleChange} checked={sidebardata.type === "sale"} />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" onChange={handleChange} checked={sidebardata.offer} />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Amenities:</label>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" onChange={handleChange} checked={sidebardata.parking} />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" onChange={handleChange} checked={sidebardata.furnished} />
              <span>Furnished</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Price Range:</label>
            <div className="flex items-center gap-2">
              <input
                type="number" id="minPrice" placeholder="Min price"
                className="border rounded-lg p-3 w-full" value={sidebardata.minPrice}
                onChange={handleChange} min="0"
              />
              <span className="text-slate-500">–</span>
              <input
                type="number" id="maxPrice" placeholder="Max price"
                className="border rounded-lg p-3 w-full" value={sidebardata.maxPrice}
                onChange={handleChange} min="0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={"createdAt_desc"}
              id="sort_order"
              className="border rounded-lg p-3"
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">
          Listing results:
          {!loading && total > 0 && (
            <span className="text-base font-normal text-slate-500 ml-2">({total} found)</span>
          )}
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {/* Loading skeleton */}
          {loading && Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}

          {/* Empty state */}
          {!loading && listings.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
              <MdSearchOff className="text-7xl" />
              <p className="text-2xl font-semibold">No listings found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          )}

          {!loading && listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} />
          ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pb-8 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-slate-100"
            >
              ‹ Prev
            </button>
            {currentPage > 2 && (
              <>
                <button onClick={() => goToPage(0)} className="px-3 py-1 rounded border hover:bg-slate-100">1</button>
                {currentPage > 3 && <span className="px-1">…</span>}
              </>
            )}
            {pageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-3 py-1 rounded border ${p === currentPage ? 'bg-slate-700 text-white' : 'hover:bg-slate-100'}`}
              >
                {p + 1}
              </button>
            ))}
            {currentPage < totalPages - 3 && (
              <>
                {currentPage < totalPages - 4 && <span className="px-1">…</span>}
                <button onClick={() => goToPage(totalPages - 1)} className="px-3 py-1 rounded border hover:bg-slate-100">{totalPages}</button>
              </>
            )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-slate-100"
            >
              Next ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

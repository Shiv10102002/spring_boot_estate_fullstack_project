import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import React from "react";

function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/v1/user/${listing.userRef}`);
        const data = await res.json();
        if (data.success === false) {
          setError(data.message);
          return;
        }
        setLandlord(data.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);
  return (
    <>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows="2"
            value={message}
            onChange={onChange}
            placeholder="Enter your message here..."
            className="w-full border p-3 rounded-lg"
          ></textarea>

          <Link
            to={`mailto:${landlord.email}?subject=${encodeURIComponent(
              `Regarding ${listing.name}`
            )}&body=${encodeURIComponent(message)}`}
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
          >
            Send Message
          </Link>
        </div>
      )}
    </>
  );
}

export default Contact;

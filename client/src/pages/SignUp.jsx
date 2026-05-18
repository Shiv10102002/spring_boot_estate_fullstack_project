import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Oauth from "../component/Oauth";
function SignUp() {
  const [formData, setFormData] = useState({ roleName: "BUYER" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRoleSelect = (roleName) => {
    setFormData({ ...formData, roleName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      setFormData({ role: "BUYER" });
      navigate("/sign-in");
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  return (
    <div className="py-3 max-w-lg mx-3 sm:mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
        <input
          type="text"
          placeholder="name"
          className="outline-none border rounded-md p-3 "
          id="username"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          className="outline-none border rounded-md p-3"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          className="outline-none border rounded-md p-3"
          id="password"
          onChange={handleChange}
        />

        {/* Role selection */}
        <div>
          <p className="font-medium text-gray-700 mb-2">I am a:</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect("BUYER")}
              className={`flex-1 p-3 rounded-lg border-2 font-semibold transition-colors ${
                formData.roleName === "BUYER"
                  ? "border-slate-700 bg-slate-700 text-white"
                  : "border-slate-300 text-slate-700 hover:border-slate-500"
              }`}
            >
              🏠 Buyer / Renter
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("OWNER")}
              className={`flex-1 p-3 rounded-lg border-2 font-semibold transition-colors ${
                formData.roleName === "OWNER"
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-slate-300 text-slate-700 hover:border-green-500"
              }`}
            >
              🏡 Property Owner
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.roleName === "OWNER"
              ? "You will be able to list and manage properties."
              : "You can browse and contact property owners."}
          </p>
        </div>

        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95"
        >
          {loading ? "Loading..." : "Sign up"}
        </button>
        <Oauth />
      </form>
      <div className="flex py-3">
        <p> Have an account ? </p>
        <Link to={"/sign-in"}>
          <span className="text-blue-700">Sign in</span>
        </Link>
      </div>
      <div>{error && <p className="text-red-500 mt-5">{error}</p>}</div>
    </div>
  );
}

export default SignUp;

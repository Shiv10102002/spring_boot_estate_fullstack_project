import { React, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signinStart,
  signinFailed,
  signinSuccess,
} from "../redux/user/userSlice";
import Oauth from "../component/Oauth";
function Signin() {
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.user);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signinStart());
      const res = await fetch("/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signinFailed(data.message));

        return;
      }
      dispatch(signinSuccess(data.data));
      setFormData({});
      navigate("/");
    } catch (error) {
      dispatch(signinFailed(error.message));
    }
  };
  return (
    <div className="py-3 max-w-lg mx-3 sm:mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
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
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
        <Oauth />
      </form>
      <div className="flex py-3 justify-between items-center">
        <div className="flex gap-1">
          <p>Dont Have an account?</p>
          <Link to={"/sign-up"}>
            <span className="text-blue-700">Sign Up</span>
          </Link>
        </div>
        <Link to={"/forgot-password"} className="text-sm text-slate-500 hover:underline">
          Forgot password?
        </Link>
      </div>
      <div>{error && <p className="text-red-500 mt-5">{error}</p>}</div>
    </div>
  );
}

export default Signin;

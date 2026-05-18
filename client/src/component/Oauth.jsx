import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signinSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import React from "react";

function Oauth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const handleGoogleClick = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const Provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, Provider);
      const res = await fetch("/api/v1/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        return;
      }
      dispatch(signinSuccess(data.data));
      navigate("/");
    } catch (error) {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      disabled={loading}
      className="bg-red-700 rounded-lg p-3 uppercase text-white hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? "Signing in..." : "Continue with google"}
    </button>
  );
}

export default Oauth;

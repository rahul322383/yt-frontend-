/* eslint-disable no-unused-vars */
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import { useNavigate, useLocation } from "react-router-dom"; // Updated import
// import { Loader2 } from "lucide-react";
// import "../../index.css"

// const ForgetPasswordPage = () => {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate(); // Updated navigate hook
//   const location = useLocation(); // Updated location hook

//   // Auto-fill email from query param
//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const emailFromQuery = queryParams.get("email");
//     if (emailFromQuery) {
//       setEmail(emailFromQuery);
//     }
//   }, [location.search]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await axios.post("/api/v1/users/forget-password", { email });
//       toast.success("Password reset link sent to your email");
//       navigate("/Verify-otp"); // Redirect after successful submission
//     } catch (err) {
//       toast.error("Failed to send reset link. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
//         <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password</h2>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500"
//             required
//           />

//            <button
//               type="button"
//               className="text-sm text-yellow-300 hover:underline"
//               onClick={() => navigate("/verify-otp")}
//             >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 <span>Sending...</span>
//               </>
//             ) : (
//               "Send Reset Link"
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ForgetPasswordPage;



"use client"


import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import "../../index.css";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/v1/users/sendemail/send-otp", { email });
      toast.success("📧 Password reset link sent to your email!");
      navigate("/Verify-otp"); // Redirect on success
    } catch (err) {
      toast.error("❌ Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition duration-200 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have a code?{" "}
            <button
              type="button"
              onClick={() => navigate("/Verify-otp")}
              className="text-yellow-500 hover:underline"
            >
              Verify OTP
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;

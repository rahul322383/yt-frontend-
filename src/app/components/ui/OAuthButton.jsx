// src/components/OAuthButton.jsx
import process from "process";
export default function OAuthButton({ provider }) {
    const handleLogin = () => {
      const width = 500;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
  
      const oauthWindow = window.open(
        `http://localhost:8000/api/v1/auth/${provider}`,
        "_blank",
        `width=${width},height=${height},left=${left},top=${top}`
      );
  
      const timer = setInterval(() => {
        if (oauthWindow?.closed) {
          clearInterval(timer);
          window.location.reload(); // or call API to get user data
        }
      }, 1000);
    };
  
    const providerMap = {
      google: "Google",
      github: "GitHub",
      facebook: "Facebook",
    };
  
    return (
      <button
        className="w-full px-4 py-2 mt-2 border rounded-md hover:bg-gray-100"
        onClick={handleLogin}
      >
        Continue with {providerMap[provider]}
      </button>
    );
  }
  
const AuthLayout = () => {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100 dark:bg-gray-900">
        {/* Left side branding panel (only for md+) */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-10">
          <h1 className="text-3xl font-bold">🎬 YourTube Studio</h1>
        </div>
  
        {/* Right side form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <Outlet />
          </div>
        </div>
      </div>
    );
  };
  
  export default AuthLayout;  
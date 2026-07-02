import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Sakshi Admin Login</h1>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

const Login = () => {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" placeholder="admin@sakshi.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" placeholder="••••••••" />
      </div>
      <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Login</button>
    </form>
  );
};

export default Login;

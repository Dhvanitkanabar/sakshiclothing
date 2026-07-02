const Topbar = () => {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Admin User</span>
        <button className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600">Logout</button>
      </div>
    </header>
  );
};

export default Topbar;

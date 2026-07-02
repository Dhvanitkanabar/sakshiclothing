const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">128</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">₹45,200</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Active Customers</h3>
          <p className="text-2xl font-bold">89</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

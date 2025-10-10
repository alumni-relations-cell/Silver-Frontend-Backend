import { Link, Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div >
      {/* Sidebar */}
      <aside className=" bg-white-800 text-black p-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1> 
        
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <p>Created With Love for Alumni Relations Cell</p>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
// AdminLayout.jsx
export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
}
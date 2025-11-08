import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../../lib/api"; // baseURL comes from VITE_API_BASE_URL

// FileUploadButton Component
const FileUploadButton = ({ file, setFile }) => {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
      />
      <label
        htmlFor="file-upload"
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded cursor-pointer hover:bg-gray-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4m0-6V4m0 0l-4 4m4-4l4 4"
          />
        </svg>
        Choose File
      </label>
      {fileName && (
        <span className="text-gray-300 text-sm truncate max-w-xs">{fileName}</span>
      )}
    </div>
  );
};

const AdminMemories = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("adminToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
  const category = "memories_page"; // fixed category

  const fetchImages = async () => {
    try {
      const res = await api.get("/api/admin/images", {
        headers: authHeaders,
        params: { category },
      });
      setImages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to load images";
      toast.error(msg);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.warn("Please select a file first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);

    try {
      // Do not set Content-Type manually — axios sets the correct boundary.
      const res = await api.post("/api/admin/images/upload", formData, {
        headers: authHeaders,
      });

      if (!res || res.status >= 400) throw new Error("Upload failed");

      toast.success("✅ Image uploaded!");
      setFile(null);
      fetchImages();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image permanently?")) return;

    try {
      const res = await api.delete(`/api/admin/images/${id}`, {
        headers: authHeaders,
      });

      if (!res || res.status >= 400) throw new Error("Delete failed");

      toast.success("🗑️ Image deleted!");
      fetchImages();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // same behavior as your original file

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Memories Page Images</h2>

      <div className="flex items-center gap-3 mb-4">
        <FileUploadButton file={file} setFile={setFile} />

        <button
          onClick={handleUpload}
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded font-semibold text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img._id} className="bg-gray-700 p-2 rounded relative">
            <img src={img.url} alt="uploaded" className="rounded w-full" loading="lazy" />
            <button
              onClick={() => handleDelete(img._id)}
              className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminMemories;

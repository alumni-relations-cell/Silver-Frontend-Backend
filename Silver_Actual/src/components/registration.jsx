import React, { useState } from "react";

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    contact: "",
    email: "",
    linkedin: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.batch.trim()) newErrors.batch = "Batch is required";

    const contactRegex = /^[0-9]{10}$/;
    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!contactRegex.test(formData.contact)) {
      newErrors.contact = "Invalid contact number";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/event/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      setMessage({ type: "success", text: "Registration successful!" });
      setFormData({ name: "", batch: "", contact: "", email: "", linkedin: "" });
      setErrors({});
      setTimeout(() => setMessage(null), 5000); // hide message after 5s
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-2xl bg-[#292929] rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Event Registration
        </h2>

        {message && (
          <div
            className={`mb-6 p-4 text-center rounded ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            } text-white`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block mb-2 text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                errors.name ? "border border-red-500" : "border border-[#444444]"
              }`}
            />
            {errors.name && <p className="text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Batch */}
          <div>
            <label className="block mb-2 text-gray-300">Batch</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                errors.batch ? "border border-red-500" : "border border-[#444444]"
              }`}
            />
            {errors.batch && <p className="text-red-400 mt-1">{errors.batch}</p>}
          </div>

          {/* Contact & Email */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block mb-2 text-gray-300">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                  errors.contact ? "border border-red-500" : "border border-[#444444]"
                }`}
              />
              {errors.contact && <p className="text-red-400 mt-1">{errors.contact}</p>}
            </div>

            <div className="flex-1">
              <label className="block mb-2 text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                  errors.email ? "border border-red-500" : "border border-[#444444]"
                }`}
              />
              {errors.email && <p className="text-red-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block mb-2 text-gray-300">LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#333333] text-white border border-[#444444] focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EE634F] hover:bg-[#d65544] text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;

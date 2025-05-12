"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Upload,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "checking" | "available" | "unavailable" | "idle"
  >("idle");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { signup } = useAuth();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Check username availability after user stops typing
    if (name === "username" && value.trim().length > 2) {
      // Clear any existing timeout
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }

      setUsernameStatus("checking");

      // Set a new timeout
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 2000); // 2 second delay
    } else if (name === "username" && value.trim().length <= 2) {
      setUsernameStatus("idle");
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    }
  };

  // Check if username is available
  const checkUsernameAvailability = async (username: string) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/check-username/${username}`
      );

      setUsernameStatus(data.available ? "available" : "unavailable");
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameStatus("idle");
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          photo: "File size should be less than 2MB",
        }));
        return;
      }

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });

      setPhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (formData.name.trim().length < 2) {
      errors.name = "Name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "Passwords do not match";
    }

    if (usernameStatus === "unavailable") {
      errors.username = "This username is already taken";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("passwordConfirm", formData.passwordConfirm);

      if (photo) {
        submitData.append("photo", photo);
      }

      await signup(submitData);
      toast.success("Account created successfully");
      router.push("dashboard");
    } catch (err) {
      let errorMessage = "Invalid ";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-sm text-gray-500">Sign up to get started</p>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field with availability check */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
                required
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  validationErrors.username
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:border-gray-400 focus:ring-gray-200"
                }`}
              />
              {usernameStatus === "checking" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              {usernameStatus === "available" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {usernameStatus === "unavailable" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {validationErrors.username && (
              <p className="text-xs text-red-600">
                {validationErrors.username}
              </p>
            )}
            {usernameStatus === "available" && (
              <p className="text-xs text-green-600">Username is available</p>
            )}
            {usernameStatus === "unavailable" && (
              <p className="text-xs text-red-600">Username is already taken</p>
            )}
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              disabled={isLoading}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                validationErrors.name
                  ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:border-gray-400 focus:ring-gray-200"
              }`}
            />
            {validationErrors.name && (
              <p className="text-xs text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              disabled={isLoading}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                validationErrors.email
                  ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:border-gray-400 focus:ring-gray-200"
              }`}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  validationErrors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:border-gray-400 focus:ring-gray-200"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-xs text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Password Confirmation field */}
          <div className="space-y-2">
            <label htmlFor="passwordConfirm" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  validationErrors.passwordConfirm
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:border-gray-400 focus:ring-gray-200"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                tabIndex={-1}
              >
                {showPasswordConfirm ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            {validationErrors.passwordConfirm && (
              <p className="text-xs text-red-600">
                {validationErrors.passwordConfirm}
              </p>
            )}
          </div>

          {/* Photo upload field - improved design */}
          <div className="space-y-3">
            <label htmlFor="photo" className="text-sm font-medium">
              Profile Photo (Optional)
            </label>

            <div className="flex flex-col items-center">
              {/* Photo preview area */}
              <div className="mb-4 flex justify-center">
                {photoPreview ? (
                  <div className="relative">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md">
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-red-500 shadow-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Upload area */}
              <div
                className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  photoPreview
                    ? "border-gray-200 bg-gray-50"
                    : "border-blue-200 bg-blue-50 hover:bg-blue-100"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    if (file.type.startsWith("image/")) {
                      setPhoto(file);

                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotoPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              >
                <input
                  id="photo-upload"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute h-full w-full cursor-pointer opacity-0"
                  disabled={isLoading}
                />

                {!photoPreview ? (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-blue-500">
                      {photo ? photo.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (Max. 2MB)
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-600">
                    Click or drag to change photo
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={
              isLoading ||
              usernameStatus === "checking" ||
              usernameStatus === "unavailable"
            }
            className={`w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ||
              usernameStatus === "checking" ||
              usernameStatus === "unavailable"
                ? "cursor-not-allowed opacity-70"
                : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

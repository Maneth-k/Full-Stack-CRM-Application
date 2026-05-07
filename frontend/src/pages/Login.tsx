import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-black text-brand-white font-body-md w-full">
      {/* Dynamic Background Element */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[150px] mix-blend-screen opacity-40"></div>
        <img
          alt="Abstract background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          src="../../src/assets/red-and-blue-pillars-wallpaper-abstract-background-picjumbo-com.jpeg"
        />
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md p-4 sm:p-space-lg mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8 sm:mb-space-xl">
          <h1 className="font-display-xl text-[48px] font-black leading-[1.1] text-brand-white mb-space-sm flex items-center justify-center gap-space-sm">
            Velocity
          </h1>
          <p className="font-body-lg text-[18px] text-brand-text-sec">
            Crystal clear sales tracking
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1f1f1f]/60 backdrop-blur-md border border-[#333333] rounded-xl p-space-lg shadow-[0px_10px_40px_rgba(254,73,0,0.05)]">
          <h2 className="font-headline-md text-[24px] font-semibold text-brand-white mb-space-lg">
            Sign in to Velocity
          </h2>

          <form className="space-y-space-md" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-sm text-center mb-4 bg-red-500/10 py-2 rounded">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-space-xs uppercase"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="ghost-input w-full text-brand-white font-body-md text-[16px] py-space-sm transition-colors"
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-baseline mb-space-xs">
                <label
                  className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="font-caption text-[12px] text-brand-orange hover:text-[#d63c00] transition-colors"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                className="ghost-input w-full text-brand-white font-body-md text-[16px] py-space-sm transition-colors"
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Action Button */}
            <div className="pt-space-sm mt-8">
              <button
                type="submit"
                className="w-full bg-brand-orange text-brand-white font-label-bold text-[14px] font-bold py-space-sm px-space-md rounded uppercase tracking-wider shadow-[0px_10px_20px_rgba(254,73,0,0.15)] hover:bg-[#d63c00] transition-all active:scale-95"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

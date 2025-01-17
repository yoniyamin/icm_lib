// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import axios from "axios";
import BannerImage from "../static/img.png";
import BASE_URL from "../utils/apiConfig.js";

// eslint-disable-next-line react/prop-types
const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}/api/login`, { username, password });
            if (response.status === 200) {
                // Save token to localStorage for persistence
                localStorage.setItem("authToken", response.data.token);
                onLogin();
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-80"
            >
                <h1 className="text-xl font-semibold mb-4">Login</h1>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="mb-4">
                    <img src={BannerImage} alt="ICM Library Logo" className="max-h-16 sm:max-h-20"/>
                    <label className="block text-gray-700 text-sm mb-2">Username</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-2">Password</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;

import React, { useState } from "react";
import axios from "axios";
import BannerImage from "../static/img.png";
import BookshelfImage from "../static/bookshelf.png";
import BASE_URL from "../utils/apiConfig.js";
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { language, toggleLanguage, direction } = useLanguage();
    const LABELS = getFieldLabels(language);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${BASE_URL}/api/login`, { username, password });
            if (response.status === 200) {
                localStorage.setItem("authToken", response.data.token);
                onLogin();
            }
        } catch (err) {
            setError(LABELS.invalid_credentials);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center">
            {/* Language Toggle Button */}
            <button
                className="w-12 h-12 flex items-center justify-center rounded-full border border-teal-500 bg-white text-teal-500 shadow-md absolute top-2 left-2"
                onClick={toggleLanguage}
            >
                {language === 'en' ? 'HE' : 'EN'}
            </button>

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                    backgroundImage: `url(${BookshelfImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Login Form Container */}
            <div className="relative z-10 w-full max-w-[320px] sm:max-w-[380px] mx-4 rounded-3xl overflow-hidden shadow-xl">
                {/* Banner Container */}
                <div className="bg-white rounded-3xl p-4">
                    <img
                        src={BannerImage}
                        alt="ICM Library Logo"
                        className="h-12 sm:h-16 w-auto mx-auto"
                    />
                </div>

                {/* Login Form */}
                <div dir={direction}>
                    <form
                        onSubmit={handleSubmit}
                        className="backdrop-blur-sm bg-white/20 p-6 sm:p-8 rounded-3xl"
                    >
                        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
                            {LABELS.login_title}
                        </h1>

                        {error && (
                            <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    {LABELS.username}
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-md
                                             bg-white/50 backdrop-blur-sm focus:ring-2
                                             focus:ring-blue-500 focus:border-transparent"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={LABELS.username_placeholder}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    {LABELS.password}
                                </label>
                                <input
                                    type="password"
                                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-md
                                             bg-white/50 backdrop-blur-sm focus:ring-2
                                             focus:ring-blue-500 focus:border-transparent"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={LABELS.password_placeholder}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-2.5 sm:py-3 rounded-md transition duration-200 
                                         ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
                                } text-white font-semibold shadow-md`}
                                disabled={loading}
                            >
                                {loading ? LABELS.logging_in : LABELS.login_button}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
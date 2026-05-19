import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, illustrationText }) => {
    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* --- LEFT SIDE: ILLUSTRATION & BRAND --- */}
            <div className="hidden lg:flex w-1/2 p-12 flex-col justify-between">
                {/* Brand Name (Top Left in reference) */}
                <h1 className="text-3xl font-bold text-sync-blue">
                    StudySync
                </h1>

                {/* Flat Illustration (Centered in reference) */}
                {/* Note: You will eventually place your physical illustration asset here.
                   I will use a placeholder indicating the style. */}
                <div className="flex-grow flex items-center justify-center p-8">
                    <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg border border-sync-border p-10 text-center">
                        <div className="text-8xl mb-8">🧑‍💻👩‍💻</div>
                        <p className="text-sync-text text-xl max-w-sm">
                            {illustrationText || "Collaborative studying, refined."}
                        </p>
                        {/* Placeholder for the blue shape below people */}
                        <div className="w-full h-24 mt-8 bg-sync-blue rounded-xl opacity-80"></div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: FORM AREA --- */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 sm:p-12 md:p-16">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
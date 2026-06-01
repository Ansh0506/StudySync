// Optional split-screen wrapper for auth pages that want shared branding.
const AuthLayout = ({ children, illustrationText }) => {
    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Branding/illustration side, hidden on small screens. */}
            <div className="hidden lg:flex w-1/2 p-12 flex-col justify-between">
                <h1 className="text-3xl font-bold text-sync-blue">
                    StudySync
                </h1>

                {/* Placeholder illustration area for future auth artwork. */}
                <div className="flex-grow flex items-center justify-center p-8">
                    <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg border border-sync-border p-10 text-center">
                        <div className="text-8xl mb-8">🧑‍💻👩‍💻</div>
                        <p className="text-sync-text text-xl max-w-sm">
                            {illustrationText || "Collaborative studying, refined."}
                        </p>
                        <div className="w-full h-24 mt-8 bg-sync-blue rounded-xl opacity-80"></div>
                    </div>
                </div>
            </div>

            {/* Form content is provided by the page using this layout. */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 sm:p-12 md:p-16">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

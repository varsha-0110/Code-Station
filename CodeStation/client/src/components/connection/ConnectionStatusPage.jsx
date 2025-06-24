import { useNavigate } from "react-router-dom";

/**
 * Displays a connection error screen with retry and home navigation options.
 */
function ConnectionStatusPage() {
    return (
        <div className="flex h-screen min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
            <ConnectionError />
        </div>
    );
}

/**
 * Error UI shown on connection failure.
 */
const ConnectionError = () => {
    const navigate = useNavigate();

    const reloadPage = () => {
        window.location.reload();
    };

    const gotoHomePage = () => {
        navigate("/");
    };

    return (
        <>
            <span className="whitespace-break-spaces text-lg font-medium text-slate-300">
                Oops! Something went wrong. Please try again
            </span>
            <div className="flex flex-wrap justify-center gap-4">
                <button
                    className="mr-4 rounded-md bg-primary px-8 py-2 font-bold text-black"
                    onClick={reloadPage}
                >
                    Try Again
                </button>
                <button
                    className="rounded-md bg-primary px-8 py-2 font-bold text-black"
                    onClick={gotoHomePage}
                >
                    Go to HomePage
                </button>
            </div>
        </>
    );
};

export default ConnectionStatusPage;


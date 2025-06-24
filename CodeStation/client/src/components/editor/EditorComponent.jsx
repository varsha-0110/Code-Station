import { useFileSystem } from "@/context/FileContext";
import useResponsive from "@/hooks/useResponsive";
import cn from "classnames";
import Editor from "./Editor";
import FileTab from "./FileTab";

// Main editor component that handles file display and responsive layout
function EditorComponent() {
    const { openFiles } = useFileSystem();
    const { minHeightReached } = useResponsive();

    // Show message when no files are open
    if (openFiles.length <= 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <h1 className="text-xl text-white">
                    No file is currently open.
                </h1>
            </div>
        );
    }

    // Render file tabs and editor when files are open
    return (
        <main
            className={cn("flex w-full flex-col overflow-x-auto md:h-screen", {
                "h-[calc(100vh-50px)]": !minHeightReached,
                "h-full": minHeightReached,
            })}
        >
            <FileTab />
            <Editor />
        </main>
    );
}

export default EditorComponent;
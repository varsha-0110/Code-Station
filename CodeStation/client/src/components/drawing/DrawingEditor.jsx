import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useCallback, useEffect } from "react";
import { Tldraw, useEditor } from "tldraw";

// Socket event constants
const SocketEvent = {
    DRAWING_UPDATE: "DRAWING_UPDATE"
};

/**
 * Wrapper component for the collaborative drawing editor using Tldraw.
 */
function DrawingEditor() {
    const { isMobile } = useWindowDimensions();

    return (
        <Tldraw
            inferDarkMode
            forceMobile={isMobile}
            defaultName="Editor"
            className="z-0"
        >
            <ReachEditor />
        </Tldraw>
    );
}

/**
 * Handles synchronization of the editor with remote clients.
 */
function ReachEditor() {
    const editor = useEditor();
    const { drawingData, setDrawingData } = useAppContext();
    const { socket } = useSocket();

    // Handle local drawing changes and emit to other clients
    const handleChangeEvent = useCallback((change) => {
        const snapshot = change.changes;

        // Update drawing data in local context
        setDrawingData(editor.store.getSnapshot());

        // Emit changes to other clients
        socket.emit(SocketEvent.DRAWING_UPDATE, { snapshot });
    }, [editor.store, setDrawingData, socket]);

    // Handle incoming drawing updates from remote clients
    const handleRemoteDrawing = useCallback(({ snapshot }) => {
        editor.store.mergeRemoteChanges(() => {
            const { added, updated, removed } = snapshot;

            Object.values(added).forEach((record) => {
                editor.store.put([record]);
            });
            Object.values(updated).forEach(([, to]) => {
                editor.store.put([to]);
            });
            Object.values(removed).forEach((record) => {
                editor.store.remove([record.id]);
            });
        });

        setDrawingData(editor.store.getSnapshot());
    }, [editor.store, setDrawingData]);

    // Load initial drawing data when component mounts
    useEffect(() => {
        if (drawingData && Object.keys(drawingData).length > 0) {
            editor.store.loadSnapshot(drawingData);
        }
    }, []);

    // Set up event listeners for drawing changes and socket events
    useEffect(() => {
        const cleanupFunction = editor.store.listen(handleChangeEvent, {
            source: "user",
            scope: "document",
        });

        socket.on(SocketEvent.DRAWING_UPDATE, handleRemoteDrawing);

        return () => {
            cleanupFunction();
            socket.off(SocketEvent.DRAWING_UPDATE);
        };
    }, [drawingData, editor.store, handleChangeEvent, handleRemoteDrawing, socket]);

    return null;
}

export default DrawingEditor;
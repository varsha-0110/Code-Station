import {
    createContext,
    useContext,
    useMemo,
    useEffect,
    useCallback,
    useRef
} from "react"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"
import { useAppContext } from "./AppContext"
import { USER_STATUS } from "@/types/user"

// Custom event constants (make sure these are defined properly in your project)
import { SocketEvent } from "@/types/socket"

const SocketContext = createContext(null)

export const useSocket = () => {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

const SocketProvider = ({ children }) => {
    const {
        users,
        setUsers,
        setStatus,
        setCurrentUser,
        drawingData,
        setDrawingData,
        // Add messages state to AppContext if not already present
        setMessages, // You'll need to add this to your AppContext
    } = useAppContext()

    const socket = useMemo(() => io(BACKEND_URL, { reconnectionAttempts: 2 }), [])
    const syncTimeoutRef = useRef(null)

    const handleError = useCallback((err) => {
        console.error("Socket error:", err)
        setStatus(USER_STATUS.CONNECTION_FAILED)
        toast.dismiss()
        toast.error("Failed to connect to the server")
    }, [setStatus])

    const handleUsernameExist = useCallback(() => {
        toast.dismiss()
        setStatus(USER_STATUS.INITIAL)
        toast.error(
            "The username you chose already exists in the room. Please choose a different username."
        )
    }, [setStatus])

    const handleJoiningAccept = useCallback(({ user, users }) => {
        setCurrentUser(user)
        setUsers(users)
        toast.dismiss()
        setStatus(USER_STATUS.JOINED)

        // Only show loading toast if there are other users (potential data to sync)
        if (users.length > 1) {
            toast.loading("Syncing data, please wait...")
            
            // Set a timeout to dismiss the loading toast if sync takes too long
            syncTimeoutRef.current = setTimeout(() => {
                toast.dismiss()
                console.log("Sync timeout - dismissing loading toast")
            }, 5000) // 5 second timeout
        }
    }, [setCurrentUser, setStatus, setUsers])

    const handleUserLeft = useCallback(({ user }) => {
        toast.success(`${user.username} left the room`)
        setUsers((prevUsers) => prevUsers.filter(u => u.username !== user.username))
    }, [setUsers])

    const handleUserJoined = useCallback(({ user }) => {
        setUsers((prevUsers) => {
            // Avoid duplicates
            if (prevUsers.some(u => u.username === user.username)) return prevUsers;
            return [...prevUsers, user];
        });
        toast.success(`${user.username} joined the room`);
    }, [setUsers]);

    const handleRequestDrawing = useCallback(({ socketId }) => {
        console.log("Requesting drawing sync for socketId:", socketId);
        if (drawingData && Object.keys(drawingData).length > 0) {
            socket.emit(SocketEvent.SYNC_DRAWING, { socketId, drawingData });
        } else {
            // If there's no drawing data to sync, send empty data
            socket.emit(SocketEvent.SYNC_DRAWING, { socketId, drawingData: {} });
        }
    }, [drawingData, socket])

    const handleDrawingSync = useCallback(({ drawingData }) => {
        console.log("Received drawing sync data:", drawingData);
        setDrawingData(drawingData);
        
        // Clear the sync timeout and dismiss loading toast
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = null
        }
        toast.dismiss();
    }, [setDrawingData])

    // Handle when there's no drawing data to sync (new event from backend)
    const handleNoDrawingData = useCallback(() => {
        console.log("No drawing data available for sync");
        
        // Clear the sync timeout and dismiss loading toast
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = null
        }
        toast.dismiss();
    }, [])

    // NEW: Handle message synchronization
    const handleSyncMessages = useCallback(({ messages }) => {
        console.log("Received message sync data:", messages);
        setMessages(messages);
        
        // Clear the sync timeout and dismiss loading toast if this is the last sync operation
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = null
        }
        toast.dismiss();
    }, [setMessages])

    useEffect(() => {
        socket.on("connect_error", handleError)
        socket.on("connect_failed", handleError)
        socket.on(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
        socket.on(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
        socket.on(SocketEvent.USER_JOINED, handleUserJoined)
        socket.on(SocketEvent.USER_DISCONNECTED, handleUserLeft)
        socket.on(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
        socket.on(SocketEvent.SYNC_DRAWING, handleDrawingSync)
        // Add handler for no drawing data event
        socket.on(SocketEvent.NO_DRAWING_DATA, handleNoDrawingData)
        // NEW: Add handler for message synchronization
        socket.on(SocketEvent.SYNC_MESSAGES, handleSyncMessages)

        return () => {
            // Clear timeout on cleanup
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current)
            }
            
            socket.off("connect_error", handleError)
            socket.off("connect_failed", handleError)
            socket.off(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
            socket.off(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
            socket.off(SocketEvent.USER_JOINED, handleUserJoined)
            socket.off(SocketEvent.USER_DISCONNECTED, handleUserLeft)
            socket.off(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
            socket.off(SocketEvent.SYNC_DRAWING, handleDrawingSync)
            socket.off(SocketEvent.NO_DRAWING_DATA, handleNoDrawingData)
            socket.off(SocketEvent.SYNC_MESSAGES, handleSyncMessages)
        }
    }, [
        handleError,
        handleUsernameExist,
        handleJoiningAccept,
        handleUserJoined,
        handleUserLeft,
        handleRequestDrawing,
        handleDrawingSync,
        handleNoDrawingData,
        handleSyncMessages,
        socket,
    ])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}

export { SocketProvider }
export default SocketContext
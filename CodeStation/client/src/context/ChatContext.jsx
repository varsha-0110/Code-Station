import { createContext, useContext, useEffect, useState } from "react"
import { SocketEvent } from "@/types/socket"
import { useSocket } from "./SocketContext"

const ChatContext = createContext(null)

export const useChatRoom = () => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error("useChatRoom must be used within a ChatContextProvider")
    }
    return context
}

function ChatContextProvider({ children }) {
    const { socket } = useSocket()
    const [messages, setMessages] = useState([])
    const [isNewMessage, setIsNewMessage] = useState(false)
    const [lastScrollHeight, setLastScrollHeight] = useState(0)

    useEffect(() => {
        // Handle receiving new messages
        socket.on(SocketEvent.RECEIVE_MESSAGE, ({ message }) => {
            console.log("Received message:", message);
            console.log("Current socket id:", socket.id);
            console.log("Message from user:", message.username);
            setMessages((prevMessages) => [...prevMessages, message]);
            setIsNewMessage(true);
        });

        // NEW: Handle synchronized messages (chat history)
        socket.on(SocketEvent.SYNC_MESSAGES, ({ messages: syncedMessages }) => {
            console.log("Received synchronized messages:", syncedMessages);
            setMessages(syncedMessages);
            // Don't set isNewMessage to true for synced messages as they're historical
        });

        return () => {
            socket.off(SocketEvent.RECEIVE_MESSAGE);
            socket.off(SocketEvent.SYNC_MESSAGES);
        };
    }, [socket]);

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                isNewMessage,
                setIsNewMessage,
                lastScrollHeight,
                setLastScrollHeight,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export { ChatContextProvider }
export default ChatContext
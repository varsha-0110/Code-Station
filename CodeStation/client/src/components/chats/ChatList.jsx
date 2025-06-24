import { useAppContext } from "@/context/AppContext";
import { useChatRoom } from "@/context/ChatContext";
import { useEffect, useRef } from "react";

/**
 * ChatList component displays the list of chat messages.
 * It handles scroll position and styling based on the current user.
 */
function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom();

    const { currentUser } = useAppContext();
    const messagesContainerRef = useRef(null);

    /**
     * Handles scroll events and updates the last scroll height.
     * @param {React.UIEvent<HTMLDivElement>} e
     */
    const handleScroll = (e) => {
        const container = e.target;
        setLastScrollHeight(container.scrollTop);
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (!messagesContainerRef.current) return;
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
    }, [messages]);

    // Restore previous scroll position if new message is flagged
    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false);
        }
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = lastScrollHeight;
        }
    }, [isNewMessage, setIsNewMessage, lastScrollHeight]);

    return (
        <div
            className="flex-grow overflow-auto rounded-md bg-darkHover p-2"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={
                        "mb-2 w-[80%] self-end break-words rounded-md bg-dark px-3 py-2" +
                        (message.username === currentUser.username
                            ? " ml-auto "
                            : "")
                    }
                >
                    <div className="flex justify-between">
                        <span className="text-xs text-primary">
                            {message.username}
                        </span>
                        <span className="text-xs text-white">
                            {message.timestamp}
                        </span>
                    </div>
                    <p className="py-1">{message.message}</p>
                </div>
            ))}
        </div>
    );
}

export default ChatList;

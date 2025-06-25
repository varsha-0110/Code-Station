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
            className="flex-grow overflow-auto rounded-md bg-transparent p-4 space-y-3"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {messages.map((message, index) => {
                const isCurrentUser = message.username === currentUser.username;
                
                return (
                    <div
                        key={index}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                                max-w-[75%] min-w-[200px] rounded-lg px-4 py-3 shadow-sm border
                                ${isCurrentUser 
                                    ? 'bg-gray-900 text-white border-blue-600' 
                                    : 'bg-transparent text-white border-gray-300'
                                }
                            `}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span 
                                    className={`text-l font-medium ${
                                        isCurrentUser 
                                            ? 'text-blue-400' 
                                            : 'text-gray-300'
                                    }`}
                                >
                                    {message.username}
                                </span>
                                <span 
                                    className={`text-xs ${
                                        isCurrentUser 
                                            ? 'text-blue-400' 
                                            : 'text-gray-300'
                                    }`}
                                >
                                    {message.timestamp}
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed break-words">
                                {message.message}
                            </p>
                        </div>
                    </div>
                );
            })}
            
            {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                </div>
            )}
        </div>
    );
}

export default ChatList;
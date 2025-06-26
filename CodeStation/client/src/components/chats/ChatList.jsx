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
    const userColorMapRef = useRef(new Map()); // Track assigned colors
    const usedColorsRef = useRef(new Set()); // Track which colors are used

    // Color palette for different users (19 light colors - excluding blue-400 for current user)
    const userColors = [
        { border: 'border-red-400', text: 'text-red-400' },
        { border: 'border-green-400', text: 'text-green-400' },
        { border: 'border-yellow-400', text: 'text-yellow-400' },
        { border: 'border-purple-400', text: 'text-purple-400' },
        { border: 'border-pink-400', text: 'text-pink-400' },
        { border: 'border-indigo-400', text: 'text-indigo-400' },
        { border: 'border-teal-400', text: 'text-teal-400' },
        { border: 'border-orange-400', text: 'text-orange-400' },
        { border: 'border-cyan-400', text: 'text-cyan-400' },
        { border: 'border-emerald-400', text: 'text-emerald-400' },
        { border: 'border-lime-400', text: 'text-lime-400' },
        { border: 'border-rose-400', text: 'text-rose-400' },
        { border: 'border-violet-400', text: 'text-violet-400' },
        { border: 'border-sky-400', text: 'text-sky-400' },
        { border: 'border-amber-400', text: 'text-amber-400' },
        { border: 'border-fuchsia-400', text: 'text-fuchsia-400' },
        { border: 'border-slate-400', text: 'text-slate-400' },
        { border: 'border-zinc-400', text: 'text-zinc-400' },
        { border: 'border-stone-400', text: 'text-stone-400' }
    ];

    /**
     * Get color for a user based on their username
     * @param {string} username - The username to get color for
     * @param {boolean} isCurrentUser - Whether this is the current user
     * @returns {object} - Object with border and text color classes
     */
    const getUserColor = (username, isCurrentUser) => {
        // Current user always gets blue-400
        if (isCurrentUser) {
            return { border: 'border-blue-400', text: 'text-blue-400' };
        }
        
        // Check if user already has an assigned color
        if (userColorMapRef.current.has(username)) {
            return userColorMapRef.current.get(username);
        }
        
        // Find an unused color
        let availableColors = userColors.filter((_, index) => 
            !usedColorsRef.current.has(index)
        );
        
        // If all colors are used, start reusing colors (shouldn't happen with 20 colors)
        if (availableColors.length === 0) {
            availableColors = userColors;
        }
        
        // Get the next available color
        const colorIndex = userColors.findIndex(color => 
            availableColors.includes(color)
        );
        
        const assignedColor = userColors[colorIndex];
        
        // Track the assignment
        userColorMapRef.current.set(username, assignedColor);
        usedColorsRef.current.add(colorIndex);
        
        return assignedColor;
    };

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
                const userColor = getUserColor(message.username, isCurrentUser);
                
                return (
                    <div
                        key={index}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                                max-w-[75%] min-w-[200px] rounded-lg px-4 py-3 shadow-sm border
                                ${isCurrentUser 
                                    ? `bg-gray-900 text-white ${userColor.border}` 
                                    : `bg-transparent text-white ${userColor.border}`
                                }
                            `}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span 
                                    className={`text-l font-medium ${userColor.text}`}
                                >
                                    {message.username}
                                </span>
                                <span 
                                    className={`text-xs ${userColor.text}`}
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
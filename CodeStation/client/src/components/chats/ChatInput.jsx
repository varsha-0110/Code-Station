import { useAppContext } from "@/context/AppContext";
import { useChatRoom } from "@/context/ChatContext";
import { useSocket } from "@/context/SocketContext";
import { formatDate } from "@/utils/formateDate";
import { SocketEvent } from "@/types/socket";
import { useRef } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { v4 as uuidV4 } from "uuid";

/**
 * ChatInput renders a text input and send button
 * allowing users to send messages to the chatroom in real-time.
 */
function ChatInput() {
    const { currentUser } = useAppContext();
    const { socket } = useSocket();
    const { setMessages } = useChatRoom();
    const inputRef = useRef(null);

    /**
     * Handles form submission to send chat message.
     * @param {React.FormEvent} e
     */
    const handleSendMessage = (e) => {
        e.preventDefault();

        const inputVal = inputRef.current?.value.trim();

        if (inputVal && inputVal.length > 0) {
            const message = {
                id: uuidV4(),
                message: inputVal,
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
            };

            socket.emit(SocketEvent.SEND_MESSAGE, { message });

            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <form
            onSubmit={handleSendMessage}
            className="flex justify-between rounded-md border border-2 border-blue-400"
        >
            <input
                type="text"
                className="w-full flex-grow rounded-md border-none bg-transparent p-2 outline-none"
                placeholder="Enter a message..."
                ref={inputRef}
            />
            <button
                className="flex items-center justify-center rounded-r-md bg-blue-400 p-2 text-black"
                type="submit"
            >
                <LuSendHorizontal size={24} />
            </button>
        </form>
    );
}

export default ChatInput;


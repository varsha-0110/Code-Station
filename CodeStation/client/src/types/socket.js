import { Socket } from "socket.io-client"

/**
 * @typedef {string} SocketId
 */

/**
 * @enum {string}
 */
// Add this to your @/types/socket file or wherever you define SocketEvent

  const SocketEvent = {
    JOIN_REQUEST: "join-request",
    USERNAME_EXISTS: "username-exists",
    USER_JOINED: "user-joined",
    JOIN_ACCEPTED: "join-accepted",
    USER_DISCONNECTED: "user-disconnected",
    SYNC_FILE_STRUCTURE: "sync-file-structure",
    DIRECTORY_CREATED: "directory-created",
    DIRECTORY_UPDATED: "directory-updated",
    DIRECTORY_RENAMED: "directory-renamed",
    DIRECTORY_DELETED: "directory-deleted",
    FILE_CREATED: "file-created",
    FILE_UPDATED: "file-updated",
    FILE_RENAMED: "file-renamed",
    FILE_DELETED: "file-deleted",
    USER_OFFLINE: "offline",
    USER_ONLINE: "online",
    SEND_MESSAGE: "send-message",
    RECEIVE_MESSAGE: "receive-message",
    SYNC_MESSAGES: "sync-messages", // NEW: For syncing chat history
    TYPING_START: "typing-start",
    TYPING_PAUSE: "typing-pause",
    REQUEST_DRAWING: "request-drawing",
    SYNC_DRAWING: "sync-drawing",
    DRAWING_UPDATE: "DRAWING_UPDATE",
    NO_DRAWING_DATA: "no-drawing-data"
}

/**
 * @typedef {Object} SocketContext
 * @property {Socket} socket
 */

export {}
export { SocketEvent }


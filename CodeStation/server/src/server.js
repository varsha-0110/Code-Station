const express = require("express")
const dotenv = require("dotenv")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")
const path = require("path")

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, "public"))) // Serve static files

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
})

// Socket Events
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
	SYNC_MESSAGES: "sync-messages", // New event for syncing chat history
	TYPING_START: "typing-start",
	TYPING_PAUSE: "typing-pause",
	REQUEST_DRAWING: "request-drawing",
	SYNC_DRAWING: "sync-drawing",
	DRAWING_UPDATE: "DRAWING_UPDATE",
	NO_DRAWING_DATA: "no-drawing-data"
}

// User Connection Status
const USER_CONNECTION_STATUS = {
	ONLINE: "ONLINE",
	OFFLINE: "OFFLINE"
}

let userSocketMap = []
// Store drawing data per room - this persists the data
let roomDrawingData = new Map() // roomId -> drawingData
// Store chat messages per room - this persists the chat history
let roomChatMessages = new Map() // roomId -> array of messages

// Function to get all users in a room
function getUsersInRoom(roomId) {
	return userSocketMap.filter((user) => user.roomId == roomId)
}

// Function to get room id by socket id
function getRoomId(socketId) {
	const roomId = userSocketMap.find(
		(user) => user.socketId === socketId
	)?.roomId

	if (!roomId) {
		console.error("Room ID is undefined for socket ID:", socketId)
		return null
	}
	return roomId
}

function getUserBySocketId(socketId) {
	const user = userSocketMap.find((user) => user.socketId === socketId)
	if (!user) {
		console.error("User not found for socket ID:", socketId)
		return null
	}
	return user
}

// Function to get drawing data for a room
function getRoomDrawingData(roomId) {
	return roomDrawingData.get(roomId) || null
}

// Function to save drawing data for a room
function saveRoomDrawingData(roomId, drawingData) {
	roomDrawingData.set(roomId, drawingData)
	console.log(`Saved drawing data for room ${roomId}`)
}

// Function to get chat messages for a room
function getRoomChatMessages(roomId) {
	return roomChatMessages.get(roomId) || []
}

// Function to save a chat message for a room
function saveRoomChatMessage(roomId, message) {
	const messages = roomChatMessages.get(roomId) || []
	messages.push(message)
	roomChatMessages.set(roomId, messages)
	console.log(`Saved message to room ${roomId}: ${message.content}`)
}

io.on("connection", (socket) => {
	// Handle user actions
	socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
		console.log(`User ${username} attempting to join room ${roomId}`);
		// Check is username exist in the room
		const isUsernameExist = getUsersInRoom(roomId).filter(
			(u) => u.username === username
		)
		if (isUsernameExist.length > 0) {
			console.log(`Username ${username} already exists in room ${roomId}`);
			io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS)
			return
		}

		const user = {
			username,
			roomId,
			status: USER_CONNECTION_STATUS.ONLINE,
			cursorPosition: 0,
			typing: false,
			socketId: socket.id,
			currentFile: null,
		}
		userSocketMap.push(user)
		socket.join(roomId)
		console.log(`User ${username} joined room ${roomId} with socket ${socket.id}`);
		console.log(`Current users in room ${roomId}:`, getUsersInRoom(roomId).map(u => u.username));
		
		const users = getUsersInRoom(roomId)
		
		// Send join accepted first
		io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
		
		// Notify other users
		socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
		
		// Send existing chat messages to the new user
		const existingMessages = getRoomChatMessages(roomId)
		if (existingMessages.length > 0) {
			console.log(`Sending ${existingMessages.length} existing messages to user ${username} in room ${roomId}`)
			io.to(socket.id).emit(SocketEvent.SYNC_MESSAGES, { messages: existingMessages })
		}
		
		// Check if there's existing drawing data for this room
		const existingDrawingData = getRoomDrawingData(roomId)
		if (existingDrawingData && Object.keys(existingDrawingData).length > 0) {
			console.log(`Sending existing drawing data to new user ${username} in room ${roomId}`)
			// Send the existing drawing data to the new user
			io.to(socket.id).emit(SocketEvent.SYNC_DRAWING, { drawingData: existingDrawingData })
		} else {
			console.log(`No existing drawing data for room ${roomId}`)
			// Let the client know there's no drawing data to sync
			io.to(socket.id).emit(SocketEvent.NO_DRAWING_DATA)
		}
	})

	socket.on("disconnecting", () => {
		const user = getUserBySocketId(socket.id);
		if (!user) {
			console.log("User not found for disconnecting socket:", socket.id);
			return;
		}
		const roomId = user.roomId;
		console.log(`User ${user.username} disconnecting from room ${roomId}`);
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.USER_DISCONNECTED, { user });
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
		socket.leave(roomId);
		console.log(`User ${user.username} removed from room ${roomId}`);
	})

	// Handle file actions
	socket.on(
		SocketEvent.SYNC_FILE_STRUCTURE,
		({ fileStructure, openFiles, activeFile }) => {
			const roomId = getRoomId(socket.id);
			if (!roomId) return;
			socket.broadcast.to(roomId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
				fileStructure,
				openFiles,
				activeFile,
			});
		}
	);

	socket.on(
		SocketEvent.DIRECTORY_CREATED,
		({ parentDirId, newDirectory }) => {
			const roomId = getRoomId(socket.id)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, {
				parentDirId,
				newDirectory,
			})
		}
	)

	socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, {
			dirId,
			children,
		})
	})

	socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, {
			dirId,
			newName,
		})
	})

	socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.DIRECTORY_DELETED, { dirId })
	})

	socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
	})

	socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, {
			fileId,
			newContent,
		})
	})

	socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, {
			fileId,
			newName,
		})
	})

	socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId })
	})

	// Handle user status
	socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: USER_CONNECTION_STATUS.OFFLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId })
	})

	socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: USER_CONNECTION_STATUS.ONLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId })
	})

	// Handle chat actions - UPDATED to persist messages
	socket.on(SocketEvent.SEND_MESSAGE, ({ message }) => {
		console.log("Server received message:", message);
		const roomId = getRoomId(socket.id);
		console.log("Message from socket:", socket.id, "in room:", roomId);
		if (!roomId) {
			console.error("No room found for socket:", socket.id);
			return;
		}
		
		// Save the message to persistent storage
		saveRoomChatMessage(roomId, message)
		
		// Broadcast to all users, including sender:
		io.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, { message });
		console.log("Message broadcasted to room:", roomId);
	})

	// Handle cursor position
	socket.on(SocketEvent.TYPING_START, ({ cursorPosition }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: true, cursorPosition }
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_START, { user })
	})

	socket.on(SocketEvent.TYPING_PAUSE, () => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: false }
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_PAUSE, { user })
	})

	// Updated drawing sync handlers
	socket.on(SocketEvent.REQUEST_DRAWING, () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id })
	})

	socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		
		// Save the drawing data to the room's persistent storage
		if (drawingData && Object.keys(drawingData).length > 0) {
			saveRoomDrawingData(roomId, drawingData)
		}
		
		// Send drawing data to the specific user who requested it
		io.to(socketId).emit(SocketEvent.SYNC_DRAWING, { drawingData })
	})

	socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }) => {
		const roomId = getRoomId(socket.id);
		console.log("Drawing update from socket:", socket.id, "in room:", roomId);
		if (!roomId) {
			console.error("No room found for drawing update from socket:", socket.id);
			return;
		}
		
		// Save the updated drawing data to persistent storage
		if (snapshot) {
			saveRoomDrawingData(roomId, snapshot)
		}
		
		// Broadcast to all other users in the room
		socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, {
			snapshot,
		});
		console.log("Drawing update broadcasted to room:", roomId);
	})
})

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
	// Send the index.html file
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
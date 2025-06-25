const io = require('socket.io-client');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const ROOM_ID = 'test-room-123';

// Create two test clients
const client1 = io(SERVER_URL);
const client2 = io(SERVER_URL);

console.log('Testing socket connections and messaging...\n');

// Test client 1
client1.on('connect', () => {
    console.log('Client 1 connected:', client1.id);
    
    // Join room
    client1.emit('join-request', { roomId: ROOM_ID, username: 'User1' });
});

client1.on('join-accepted', (data) => {
    console.log('Client 1 joined room:', data);
});

client1.on('user-joined', (data) => {
    console.log('Client 1 sees user joined:', data.user.username);
});

client1.on('receive-message', (data) => {
    console.log('Client 1 received message:', data.message);
});

// Test client 2
client2.on('connect', () => {
    console.log('Client 2 connected:', client2.id);
    
    // Join room after a short delay
    setTimeout(() => {
        client2.emit('join-request', { roomId: ROOM_ID, username: 'User2' });
    }, 1000);
});

client2.on('join-accepted', (data) => {
    console.log('Client 2 joined room:', data);
    
    // Send a test message after joining
    setTimeout(() => {
        console.log('Client 2 sending test message...');
        client2.emit('send-message', { 
            message: {
                id: 'test-msg-1',
                message: 'Hello from User2!',
                username: 'User2',
                timestamp: new Date().toISOString()
            }
        });
    }, 2000);
});

client2.on('user-joined', (data) => {
    console.log('Client 2 sees user joined:', data.user.username);
});

client2.on('receive-message', (data) => {
    console.log('Client 2 received message:', data.message);
});

// Test drawing sync
client1.on('drawing-update', (data) => {
    console.log('Client 1 received drawing update:', data.snapshot ? 'has snapshot' : 'no snapshot');
});

client2.on('drawing-update', (data) => {
    console.log('Client 2 received drawing update:', data.snapshot ? 'has snapshot' : 'no snapshot');
});

// Cleanup after test
setTimeout(() => {
    console.log('\nTest completed. Disconnecting clients...');
    client1.disconnect();
    client2.disconnect();
    process.exit(0);
}, 10000);

// Error handling
client1.on('connect_error', (error) => {
    console.error('Client 1 connection error:', error);
});

client2.on('connect_error', (error) => {
    console.error('Client 2 connection error:', error);
}); 
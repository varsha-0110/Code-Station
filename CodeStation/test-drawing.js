const io = require('socket.io-client');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const ROOM_ID = 'test-drawing-room-123';

// Create two test clients
const client1 = io(SERVER_URL);
const client2 = io(SERVER_URL);

console.log('Testing tldraw drawing synchronization...\n');

// Test client 1
client1.on('connect', () => {
    console.log('Client 1 connected:', client1.id);
    
    // Join room
    client1.emit('join-request', { roomId: ROOM_ID, username: 'Drawer1' });
});

client1.on('join-accepted', (data) => {
    console.log('Client 1 joined room:', data.user.username);
});

client1.on('user-joined', (data) => {
    console.log('Client 1 sees user joined:', data.user.username);
});

client1.on('drawing-update', (data) => {
    console.log('Client 1 received drawing update:', data.snapshot ? 'has snapshot' : 'no snapshot');
    if (data.snapshot) {
        console.log('Drawing update contains:', Object.keys(data.snapshot));
    }
});

// Test client 2
client2.on('connect', () => {
    console.log('Client 2 connected:', client2.id);
    
    // Join room after a short delay
    setTimeout(() => {
        client2.emit('join-request', { roomId: ROOM_ID, username: 'Drawer2' });
    }, 1000);
});

client2.on('join-accepted', (data) => {
    console.log('Client 2 joined room:', data.user.username);
    
    // Send a test drawing update after joining
    setTimeout(() => {
        console.log('Client 2 sending test drawing update...');
        const testSnapshot = {
            added: {
                'shape:test-1': {
                    id: 'shape:test-1',
                    typeName: 'shape',
                    type: 'rectangle',
                    x: 100,
                    y: 100,
                    props: { w: 100, h: 100, color: 'black' }
                }
            },
            updated: {},
            removed: {}
        };
        
        client2.emit('DRAWING_UPDATE', { snapshot: testSnapshot });
    }, 2000);
});

client2.on('user-joined', (data) => {
    console.log('Client 2 sees user joined:', data.user.username);
});

client2.on('drawing-update', (data) => {
    console.log('Client 2 received drawing update:', data.snapshot ? 'has snapshot' : 'no snapshot');
    if (data.snapshot) {
        console.log('Drawing update contains:', Object.keys(data.snapshot));
    }
});

// Test drawing sync request
client1.on('request-drawing', (data) => {
    console.log('Client 1 received drawing request from:', data.socketId);
    // Send some drawing data back
    const testData = {
        added: {
            'shape:sync-1': {
                id: 'shape:sync-1',
                typeName: 'shape',
                type: 'circle',
                x: 200,
                y: 200,
                props: { radius: 50, color: 'blue' }
            }
        },
        updated: {},
        removed: {}
    };
    client1.emit('sync-drawing', { socketId: data.socketId, drawingData: testData });
});

client2.on('sync-drawing', (data) => {
    console.log('Client 2 received drawing sync data:', data.drawingData ? 'has data' : 'no data');
});

// Cleanup after test
setTimeout(() => {
    console.log('\nTest completed. Disconnecting clients...');
    client1.disconnect();
    client2.disconnect();
    process.exit(0);
}, 8000);

// Error handling
client1.on('connect_error', (error) => {
    console.error('Client 1 connection error:', error);
});

client2.on('connect_error', (error) => {
    console.error('Client 2 connection error:', error);
}); 
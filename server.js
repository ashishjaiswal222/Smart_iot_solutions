const express = require('express');
const { SerialPort, ReadlineParser } = require('serialport');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
    ws.on('error', (error) => console.error('WebSocket Error:', error.message));
});

// HTTP Server
const server = app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
});

// Serial Port Configuration
const portName = '/dev/cu.usbserial-1420'; // Update with your specific port
const serialPort = new SerialPort({ path: portName, baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

serialPort.on('open', () => console.log('Serial Port Opened'));

parser.on('data', (data) => {
    const message = data.trim();
    console.log('Received from Arduino:', message);

    // Process the message
    if (message.startsWith('Moisture:')) {
        // Extract moisture value from the message
        const moistureValue = message.split(':')[1].trim();
        
        // Broadcast the moisture data to all WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`Soil Moisture: ${moistureValue}`);
            }
        });
    } else {
        // Handle other types of data here (e.g., Distance, IR Value)
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
});

serialPort.on('error', (err) => console.error('Serial Port Error:', err.message));
serialPort.on('close', () => console.log('Serial Port Closed'));

// server.js

const http = require("http");

const PORT = 3000;

// Create Server
const server = http.createServer((req, res) => {
    
    // Set Header
    res.writeHead(200, {
        "Content-Type": "application/json"
    });

    // Response Data
    const data = {
        success: true,
        message: "Test Server Running Successfully",
        method: req.method,
        url: req.url
    };

    // Send Response
    res.end(JSON.stringify(data, null, 2));
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
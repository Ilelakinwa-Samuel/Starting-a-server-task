"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const axios_1 = __importDefault(require("axios"));
const node_html_parser_1 = require("node-html-parser");
// Function to parse webpage metadata from HTML
function parseWebpageMetadata(html) {
    var _a, _b;
    const root = (0, node_html_parser_1.parse)(html);
    // Extract title from head
    const title = ((_a = root.querySelector("head > title")) === null || _a === void 0 ? void 0 : _a.text.trim()) || "";
    // Extract description from meta tag
    const description = ((_b = root
        .querySelector('head > meta[name="description"]')) === null || _b === void 0 ? void 0 : _b.getAttribute("content")) || "";
    const imageUrls = [];
    // Extract image URLs from img elements
    const imgElements = root.querySelectorAll("img");
    imgElements.forEach((element) => {
        const imageUrl = element.getAttribute("src");
        if (imageUrl) {
            imageUrls.push(imageUrl);
        }
    });
    return { title, description, imageUrls };
}
// Create an HTTP server
const server = http_1.default.createServer(async (req, res) => {
    if (req.method === "GET") {
        // Extract URL parameter from the request
        const urlParam = new URL(req.url || "", `http://${req.headers.host}`).searchParams.get("url");
        if (urlParam) {
            try {
                // Fetch the web page using axios
                const response = await axios_1.default.get(urlParam);
                const html = response.data;
                // Parse and extract metadata from the HTML
                const metadata = parseWebpageMetadata(html);
                // Set response headers and send metadata as JSON
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(metadata));
            }
            catch (error) {
                // Handle errors with a 500 status code
                res.statusCode = 500;
                res.end(JSON.stringify({ error: "An error occurred" }));
            }
        }
        else {
            // Handle missing URL parameter with a 400 status code
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Missing URL parameter" }));
        }
    }
    else {
        // Handle unsupported methods with a 404 status code
        res.statusCode = 404;
        res.end();
    }
});
// Start the server on port 3001
server.listen(3001, () => {
    console.log("Server is running on port 3001");
});

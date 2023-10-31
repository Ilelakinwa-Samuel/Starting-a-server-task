import http, { IncomingMessage, Server, ServerResponse } from "http";
import axios from "axios";
import { parse } from "node-html-parser";

// Define an interface for webpage metadata
interface WebpageMetadata {
  title: string;
  description: string;
  imageUrls: string[];
}

// Function to parse webpage metadata from HTML
function parseWebpageMetadata(html: string): WebpageMetadata {
  const root = parse(html);

  // Extract title from head
  const title = root.querySelector("head > title")?.text.trim() || "";

  // Extract description from meta tag
  const description =
    root
      .querySelector('head > meta[name="description"]')
      ?.getAttribute("content") || "";

  const imageUrls: string[] = [];

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
const server: Server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET") {
      // Extract URL parameter from the request
      const urlParam = new URL(
        req.url || "",
        `http://${req.headers.host}`
      ).searchParams.get("url");

      if (urlParam) {
        try {
          // Fetch the web page using axios
          const response = await axios.get(urlParam);
          const html = response.data;

          // Parse and extract metadata from the HTML
          const metadata = parseWebpageMetadata(html);

          // Set response headers and send metadata as JSON
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(metadata));
        } catch (error) {
          // Handle errors with a 500 status code
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "An error occurred" }));
        }
      } else {
        // Handle missing URL parameter with a 400 status code
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing URL parameter" }));
      }
    } else {
      // Handle unsupported methods with a 404 status code
      res.statusCode = 404;
      res.end();
    }
  }
);

// Start the server on port 3001
server.listen(3001, () => {
  console.log("Server is running on port 3001");
});

import http, { IncomingMessage, Server, ServerResponse } from "http";
import fs from "fs";

// Create an HTTP server
const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET") {
      // Handle GET request to retrieve data from the database
      fs.readFile("./database.json", "utf-8", (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end("no database!");
        } else {
          res.end(data);
        }
      });
    } else if (req.method === "POST") {
      // Handle POST request to add data to the database
      let newData = "";
      req.on("data", (chunk) => {
        newData += chunk;
      });
      req.on("error", (err) => {
        res.write("error processing request");
        res.end(err);
      });
      try {
        const database = require("./database.json");

        req.on("end", () => {
          const jsonFormat = JSON.parse(newData);
          jsonFormat["createdAt"] = new Date().toISOString();
          database.push(jsonFormat);
          fs.writeFile(
            "./database.json",
            JSON.stringify(database, null, 2),
            "utf-8",
            (err) => {
              if (err) {
                res.write("Failed to post into database");
                res.end(err);
              } else {
                res.end("data saved to database");
              }
            }
          );
        });
      } catch (err) {
        const jsonFormat = JSON.parse(newData);
        jsonFormat["createdAt"] = new Date().toISOString();
        req.on("end", () => {
          fs.writeFile(
            "./database.json",
            JSON.stringify([jsonFormat], null, 2),
            "utf-8",
            (err) => {
              if (err) {
                res.write("could not create database");
                res.end(err);
              } else {
                res.end("database created");
              }
            }
          );
        });
      }
    } else if (req.method === "PUT") {
      // Handle PUT request to update data in the database
      let changeData = "";
      req.on("data", (chunk) => {
        changeData += chunk;
      });
      req.on("error", (err) => {
        if (err) {
          res.write("Failed to process request");
          res.end(err);
        }
      });
      try {
        const database = require("./database.json");
        req.on("end", () => {
          const jsonFormat = JSON.parse(changeData);
          const outdated = database.find((d) => d["id"] === jsonFormat["id"]);
          if (outdated) {
            jsonFormat["updatedAt"] = new Date().toISOString();
            for (const field in jsonFormat) {
              outdated[field] = jsonFormat[field];
            }
            fs.writeFile(
              "./database.json",
              JSON.stringify(database, null, 2),
              "utf-8",
              (err) => {
                if (err) {
                  res.write("could not update data");
                  res.end(err);
                } else {
                  res.end("data successfully updated");
                }
              }
            );
          } else {
            res.end("could not find data");
          }
        });
      } catch (err) {
        res.write("Failed to connect with database");
        res.end(err);
      }
    } else if (req.method === "DELETE") {
      // Handle DELETE request to remove data from the database
      let deleteData = "";
      req.on("data", (chunk) => {
        deleteData += chunk;
      });
      req.on("error", (err) => {
        if (err) {
          res.write("Problem with request");
          res.end(err);
        }
      });
      try {
        const database = require("../database.json");
        req.on("end", () => {
          const jsonFormat = JSON.parse(deleteData);
          const remove = database.find((d) => d["id"] === jsonFormat["id"]);
          if (remove) {
            const index = database.indexOf(remove);
            database.splice(index, 1);
            fs.writeFile(
              "./database.json",
              JSON.stringify(database, null, 2),
              "utf-8",
              (err) => {
                if (err) {
                  res.write("problem deleting data");
                  res.end(err);
                } else {
                  res.end("data removed successfully");
                }
              }
            );
          } else {
            res.end("No data found matching id");
          }
        });
      } catch (err) {
        res.write("Could not connect to database");
        res.end(err);
      }
    } else {
      // Handle unsupported methods
      res.end("Unhandled operation");
    }
  }
);

// Start the server on port 3005
server.listen(3005, () => {
  console.log("Server listening on 3005");
});

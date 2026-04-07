import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

function serveSongsPlugin(): Plugin {
  const songsDir = path.resolve(__dirname, "../songs");

  return {
    name: "serve-songs",
    configureServer(server) {
      server.middlewares.use("/songs", (req, res, next) => {
        if (!req.url) return next();

        const decoded = decodeURIComponent(req.url);
        const filePath = path.join(songsDir, decoded);

        // Prevent directory traversal
        if (!filePath.startsWith(songsDir)) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        const stat = fs.statSync(filePath);
        const range = req.headers.range;

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0]!, 10);
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
          res.statusCode = 206;
          res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
          res.setHeader("Content-Length", end - start + 1);
          fs.createReadStream(filePath, { start, end }).pipe(res);
        } else {
          res.setHeader("Content-Length", stat.size);
          fs.createReadStream(filePath).pipe(res);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveSongsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3080",
        changeOrigin: true,
      },
    },
    fs: {
      allow: [".", "../songs"],
    },
  },
});

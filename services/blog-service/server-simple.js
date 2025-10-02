const express = require("express");
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(require("cors")());
app.use(require("helmet")());
app.use(require("compression")());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    service: "blog-service", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Mock blog endpoints
app.get("/api/posts", (req, res) => {
  res.json({ 
    posts: [], 
    message: "Blog Service готов к интеграции Interface",
    ready: true
  });
});

// Info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    name: "Blog Service",
    description: "Ready for Interface integration",
    endpoints: ["/api/health", "/api/posts", "/api/info"],
    integration_status: "Waiting for full Interface deployment"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Blog Service запущен на порту ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`📝 API: http://localhost:${PORT}/api/posts`);
  console.log(`ℹ️  Info: http://localhost:${PORT}/api/info`);
});
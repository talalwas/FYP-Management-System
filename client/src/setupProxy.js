const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    createProxyMiddleware("/socket.io", {
      target: "http://localhost:4000",
      ws: true,
    })
  );
};

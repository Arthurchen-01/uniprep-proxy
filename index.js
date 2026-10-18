import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 10000;

app.use('/', createProxyMiddleware({
  target: 'https://api.uniprep.world',
  changeOrigin: true,
  followRedirects: true
}));

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});

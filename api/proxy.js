const { Readable } = require('node:stream');

module.exports = async (req, res) => {
  const targetUrl = 'https://api.uniprep.world' + req.url;

  // 清洗掉所有暴露客户端地域的头部
  const headers = {};
  for (const [key, val] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (lower !== 'host' && !lower.startsWith('x-forwarded') && !lower.startsWith('x-vercel') && !lower.startsWith('x-real')) {
      headers[key] = val;
    }
  }

  try {
    const options = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // 从 Vercel 美国华盛顿 (iad1) 服务器向真实上游发起纯净请求
    const response = await fetch(targetUrl, options);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    // 完美支持流式输出 (Stream) 与普通 JSON
    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

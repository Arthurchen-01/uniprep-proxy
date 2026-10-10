const { Readable } = require('node:stream');

module.exports = async (req, res) => {
  const targetUrl = 'https://api.uniprep.world' + req.url;

  // 清洗香港客户端特征头与旧 Content-Length，防止长度不匹配
  const headers = {};
  for (const [key, val] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (
      lower !== 'host' &&
      lower !== 'content-length' &&
      !lower.startsWith('x-forwarded') &&
      !lower.startsWith('x-vercel') &&
      !lower.startsWith('x-real')
    ) {
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

    // 从美国华盛顿 (iad1) 机房发起纯净请求
    const response = await fetch(targetUrl, options);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

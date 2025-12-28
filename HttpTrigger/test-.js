require('dotenv').config();
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios');

(async () => {
    try {
        const proxy = process.env.PROXY;
        if (!proxy) throw new Error("Proxy env-dən tapılmadı!");

        const agent = new HttpsProxyAgent(proxy);

        const res = await axios.get('https://api.ipify.org?format=json', {
            httpsAgent: agent,
            timeout: 10000
        });

        console.log('🌍 Proxy ilə çıxan IP:', res.data.ip);
    } catch (err) {
        console.error('❌ Proxy test xətası:', err.message);
    }
})();

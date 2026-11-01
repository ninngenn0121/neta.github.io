const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'logs.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ログファイルがなければ初期化
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

// 1. アクセス時にIPを保存するAPI
app.post('/api/save', (req, res) => {
    // プロキシ（Renderなど）経由のIPを取得
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const time = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    const newLog = { time, ip, userAgent };

    try {
        const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        logs.push(newLog);
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to save log' });
    }
});

// 2. パスワード認証してログを返すAPI
app.post('/api/logs', (req, res) => {
    const { password } = req.body;
    if (password !== 'arupaka0121') {
        return.status(401).json({ success: false, message: 'パスワードが違います' });
    }

    try {
        const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        res.json({ success: true, logs: logs.reverse() });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to read logs' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

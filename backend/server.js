const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

//Main health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', message: 'RentEase backend is running prefectly!'});
});

app.listen(PORT, () => { console.log('Server is live on port ${PORT}');
});
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import route from './routes/userRoute.js';
const app = express();
const server = createServer(app);
app.use(express.json({ limit: '10mb' })); // For JSON payloads
app.use(express.urlencoded({ limit: '10mb', extended: true }));
const corsOptions = {
    origin: 'https://adhaar-ocr-client.vercel.app', // Frontend origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));
app.use('/', route);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { connectDB } from './db/index.js';

//initialize express app
const app = express();
const port = process.env.PORT || 3000;

//DB connection
connectDB()

// middlewares
app.use(express.json())
app.use(cors())

//Server start
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})




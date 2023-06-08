const express = require('express');
const { connection } = require('./config/db');
const {userRouter} = require('./Routes/user.Routes');
const http = require('http');
require('dotenv').config();


// in place of express server make http server



const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());



const httpServer = http.createServer(app);
app.use( userRouter);


const io = require('socket.io')(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('send', (msg) => {
        socket.broadcast.emit('receive',msg);
    });

    
});


httpServer.listen(process.env.port, async () => {
    try {
        await connection;
        console.log("connected to db");
    } catch (error) {
        console.log(error);
    }
    console.log(`listening on port ${process.env.PORT}`);
})

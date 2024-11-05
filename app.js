const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let topics = [];

app.get('/', (req, res) => {
    res.render('index', { topics });
});

app.post('/add-topic', (req, res) => {
    const newTopic = { title: req.body.title, comments: [] };
    topics.push(newTopic);
    io.emit('topicAdded', newTopic);
    res.redirect('/');
});

app.get('/topic/:index', (req, res) => {
    const topicIndex = req.params.index;
    const topic = topics[topicIndex];
    res.render('topic', { topic, index: topicIndex });
});

app.post('/topic/:index/add-comment', (req, res) => {
    const topicIndex = req.params.index;
    const comment = req.body.comment;
    topics[topicIndex].comments.push(comment);
    io.emit('commentAdded', { index: topicIndex, comment });
    res.redirect(`/topic/${topicIndex}`);
});

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

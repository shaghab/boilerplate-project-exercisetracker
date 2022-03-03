const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let userCount = 0;

class Users {
  constructor(_id, username) {
    this._id = _id;
    this.username = username
    this.count = ++userCount;
    this.exercises = [];
  }
}

class Exercises {
  constructor(_id, description, duration, date) {
    this._id = _id;
    this.description = description;
    this.duration = duration;
    this.date = date;
  }
}

const users = new Map();

app.post('/api/users', (req, res) => {
  const key = "" + (new Date()).getTime();
  users.set(key, new Users(key, req.body.username));
  res.json({ username: users.get(key).username, _id: key });
})

app.get('/api/users', (req, res) => {
  const arr = [];
  users.forEach((user) => {
    arr.push({ username: user.username, _id: user._id })
  });
  res.send(arr);
})

app.post('/api/users/:id/exercises', (req, res) => {
  let date = new Date(req.body.date);
  if (date.toString() === "Invalid Date")
    date = new Date();
  const exercise = new Exercises(
    req.params['id'],
    req.body.description,
    +req.body.duration,
    date.toDateString()
  );
  const user = users.get(req.params['id']);
  user.exercises.push(exercise);

  res.json({
    _id: exercise._id,
    username: user.username,
    date: exercise.date,
    duration: exercise.duration,
    description: exercise.description
  });
})

app.get('/api/users/:id/logs', (req, res) => {
  const user = users.get(req.params['id']);
  const json = {
    _id: user._id,
    username: user.username,
    count: user.count,
    log: stringify(user.exercises, req.query)
  }
  res.json(json);
})

const stringify = (exercises, query) => {
  const arr = [];

  let from = new Date(query.from);
  if (from.toString() === "Invalid Date") from = null;
  let to = new Date(query.to);
  if (to.toString() === "Invalid Date") to = null;
  const limit = query.limit ? query.limit : exercises.length;

  for (let i = 0; i < exercises.length && arr.length < limit; i++) {
    const date = new Date(exercises[i].date);
    if ((from == null || from <= date)
      && (to == null || to >= date)) {
      arr.push({
        description: exercises[i].description,
        duration: exercises[i].duration,
        date: exercises[i].date
      })
    }
  }
  return arr;
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

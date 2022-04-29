const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost:27017/routeDrawer');
console.log(process.env.MONGODB_URI);

const routeSchema = {name: String, markers: Array, creator: String};
const Route = mongoose.model('Route', routeSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/save-route', (req, res) => {
  const {name, positions} = req.body;
  const newRoute = new Route({name, markers: positions, creator: 'me'})
  newRoute.save();
  Route.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  })
});

app.get('/routes', (req, res) => {
  Route.find({}, (err, result) => {
    console.log(result);
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  })
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server has started on port', process.env.PORT || 3000);
});
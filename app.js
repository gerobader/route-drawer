const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost:27017/routeDrawer');

const routeSchema = {name: String, markers: Array, creator: String};
const Route = mongoose.model('Route', routeSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/save-route', (req, res) => {
  const {name, positions} = req.body;
  const newRoute = new Route({name, markers: positions, creator: 'me'})
  newRoute.save((err) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        error: 'Route could not be saved'
      });
    } else {
      Route.find({}, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.json(result);
        }
      })
    }
  });
});

app.delete('/delete-route/:routeId', (req, res) => {
  const {routeId} = req.params;
  Route.deleteOne({_id: routeId}, (err) => {
    if (err) {
      console.log(err);
    } else {
      Route.find({}, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.json(result);
        }
      })
    }
  });
});

app.get('/routes', (req, res) => {
  Route.find({}, (err, result) => {
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
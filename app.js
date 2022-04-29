const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const routes = {}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/save-route', (req, res) => {
  const {name, positions} = req.body;
  routes[name] = positions;
  res.send(routes);
});

app.get('/routes', (req, res) => {
  res.send(routes);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server has started on port', process.env.PORT || 3000);
});
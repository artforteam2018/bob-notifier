require('./Helpers')

const fs = require('fs');
let items = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
let app = require('express')();
let server = require('http').Server(app);
let socket = require('socket.io')(server);
server.listen(80);

const huobi = new (require('./huobi'))(socket);
const binance = new (require('./binance'))(socket);

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
var bodyParser = require("body-parser");
app.use(bodyParser.json())

app.get('/binance/symbols', (reg, res) => {
  res.send(binance.socket.symbols);
});

app.get('/notifier/items', (reg, res) => {
  res.send(items);
});

app.post('/notifier/items', (reg, res) => {
  items = reg.body;
  fs.writeFile('../db.json', items, () => {

  });
  res.send(true);
});

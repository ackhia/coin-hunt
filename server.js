
require('dotenv').config()

var express = require('express'),
  app = express(),
  port = process.env.PORT,
  interface = process.env.INTERFACE,
  bodyParser = require('body-parser');
  

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('static'))


var routes = require('./api/routes/marketDataRoutes'); //importing route
routes(app); //register the route


app.listen(port, interface);


console.log('market data RESTful API server started on: ' + port);
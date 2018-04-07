
'use strict';

var path = require('path');

module.exports = function(app) {
  var marketData = require('../controllers/marketDataController');

    app.route('/')
        .get(function(req,res) {     
        res.sendFile(path.resolve(__dirname + '/../../static/coinhunt.html'));
    });

    app.route('/ws/getCoins')
        .get(marketData.get_coins);
};
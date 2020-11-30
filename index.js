const express = require('express')
const path = require('path')
const db = require('./models/index.js')
const http = require('http')
const exphbs = require('express-handlebars')
const ejs = require('ejs');
const { Users, sequelize } = require('./models/index.js')


var app = express();
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')
    app.set('port', process.env.PORT || 5000)

    db.sequelize.sync().then(function() {
        http.createServer(app).listen(app.get('port'), function(){
          console.log('Express server listening on port ' + app.get('port'));
        });
      });

    

    

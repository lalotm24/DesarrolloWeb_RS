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

    app.use(express.urlencoded({extended: true}))
    app.use(express.json())
    app.use(express.static(__dirname + '/public'))

    app.listen(app.get('port'))
    app.get("/", function(request, response){
      response.render("pages/index.ejs")
    })

    app.get("/service", function(request, response){
      response.render("pages/servicios.ejs")
    })

    app.get("/nosotros", function(request, response){
      response.render("pages/nosotros.ejs")
    })

    app.get("/contactanos", function(request, response){
      response.render("pages/contactanos.ejs")
    })

    app.get("/portafolio", function(request, response){
      response.render("pages/portafolio.ejs")
    })

    // db.sequelize.sync().then(function() {
    //     http.createServer(app).listen(app.get('port'), function(){
    //       console.log('Express server listening on port ' + app.get('port'));
    //     });
    //   });
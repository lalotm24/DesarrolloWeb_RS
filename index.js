const express = require('express')
const path = require('path')
const db = require('./models/index.js')
const http = require('http')
const ejs = require('ejs');
const { Client } = require('pg');
require ('dotenv').config();
const flash = require('connect-flash');
const passport = require("passport");
const request = require('request');
const session = require("express-session");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { Passport } = require('passport');

const localStrategy = require('passport-local').Strategy;

var app = express();
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')
    app.set('port', process.env.PORT || 5000)
    app.use(require('cookie-parser')());
    app.use(session({  
      secret: 'woot'
      }));
      const LocalStrategy = require('passport-local').Strategy;
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({secret: 'key'}))
    app.use(flash())
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(express.static(__dirname + '/Public'))
    
    app.listen(app.get('port'))

    
    //Creacion del servidor
    // db.sequelize.sync().then(function() {
    //   http.createServer(app).listen(app.get('port'), function(){
    //     console.log('Express server listening on port ' + app.get('port'));
    //   });
    // });

    //Conceccion a la base de datos
    const client = new Client({
      user: 'Lalo',
      host: 'localhost',
      database: 'reflectivestudio_db',
      port: 5432
    });
    client.connect();

    passport.use('local', new localStrategy({passReqToCallback: true}, (req, username, password, done) =>{
      loginAttempt();
      async function loginAttempt(){
    
          try{
            var currentAccountsData = await JSON.stringify(client.query(`SELECT id, "email", "fName",
            "password" FROM "Users" WHERE "email"=$1`, [username], (err, result) =>{
              if(err){
                return done(err)
              }
              if(result.rows[0] == null){
                req.flash('danger', "Oops. Incorrect login details");
                return done(null, false)
              }else{
                bcrypt.compare(password, result.rows[0]["password"], (err, check) => {
                  if(err){
                    console.log('Error while checking password');
                    return done();
                  }else if(check){
                    return done(null, [{email: result.rows[0].email, firstName: result.rows[0].fName}])
                  }else{
                    req.flash('danger', "oops");
                    return done(null, false);
                  }
                });
              }
            }))
          }
          catch(e){throw (e);}
        }
      }))
    
    passport.serializeUser((user, done) => {
      done(null, user);
    })
    
    passport.deserializeUser((user, done) =>{
      done(null, user);
    })
    
    //Pagina principal
    app.get('/', (req, res) => {
      res.render('pages/index.ejs', {title: "Home", userData: req.user, messages: {
        danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')
      }})
    })

    

    app.get('/nosotros', (req, res) =>{
      res.render('pages/nosotros.ejs');
    })

    app.get('/portafolio', (req, res) =>{
      res.render('pages/portafolio.ejs');
    })

    app.get('/servicios', (req, res) =>{
      res.render('pages/servicios.ejs');
    })

    

    //pagina de crear cuenta
    app.get('/crearCuenta', function (req, res, next) {
      res.render('pages/crearCuenta.ejs', {title: "crearCuenta", userData: req.user, messages: {
          danger: req.flash('danger'), warning: req.flash('danger'), 
          success: req.flash('danger')}});
      });

      

    app.post('/crearCuenta', async (req, res) =>{

      try{
      //Agarra el pws del form
      console.log(req.body.password);
      var pwd = await bcrypt.hash(req.body.password, 5);
      
      //Demas datos del form
      console.log(bcrypt.hash(req.body.password, 5));
      console.log(this.saltSecret)
      console.log(pwd);
      await JSON.stringify(client.query(`SELECT id FROM "Users" WHERE "email"=$1`, [req.body.email], (err, result) => {
        
        if(result.rows[0]){
          req.flash('warning', "Este email ya está registrado. <a> href='login'> Log In!</a>");
          res.redirect('/');
        }else{
          client.query(`INSERT INTO "Users" (email, "fName", "lName", "createdAt", "updatedAt", password) VALUES ($1, $2, $3, NOW(), NOW(), $4)`, 
          [req.body.email, req.body.firstName, req.body.lastName, pwd], function(err, result) {
            if(err){console.log(err);
            }else{
              client.query('COMMIT')
              console.log(result)
              req.flash('success','Usuario creado.')
              res.redirect('index.ejs');
              return;
            }
            
        });

    }

  }));
}
catch(e){throw(e)}
});


app.get('/contactanos', (req, res, next) => {

  if(req.isAuthenticated()){
    res.render('pages/contactanos.ejs', {title: "Cuenta", userData: req.user, userData: req.user, messages:{
      danger: req.flash('danger'), warning: req.flash('warning'), succes: req.flash('success')
    }})
  }else{
    res.redirect('/login')
  }

})

app.post('/contactanos', async (req, res, next) => {

  await JSON.stringify(`SELECT id FROM "Users" WHERE email=$1`, [req.user.username], (err, res) => {
    if(res.rows[0]){
      client.query(`INSERT INTO ordenes (user_id, tipodeorden, comentarios, fecha) VALUES ($1, $2, $3, NOW())`, 
                    [res.rows[0][email], req.body.seleccionServicio, req.body.Text1], (er, re) =>{
                      if(err){console.log(err);
                      }else{
                        client.query('COMMIT')
                        console.log(result)
                        req.flash('success','Orden creada.')
                        res.redirect('./servicios');
                        return;
                      }
                    })
    }
  })

})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) =>{
  if(req.body.remember){
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; //La cookie dura 30 dias
  }else{
    req.session.cookie.expires = false; //la cookire expira al final de la sesion
  }
  res.redirect('/');
})

app.get('/login', (req, res, next) =>{
  if(req.isAuthenticated()){
    res.redirect('/');
  }else{
    res.render('pages/login.ejs', {title: "Log in", userData: req.user, messages: 
    {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')
  }});
  }
})





passport.use('/logout', (req, res) => {
  console.log(req.isAuthenticated());
  req.logout();
  console.log(req.isAuthenticated());
  req.flash('success', "Logged out");
  res.redirect('/');
})





const agregarUsuario = `INSERT INTO "Users" (email, "fName", "lName", "createdAt", "updatedAt") 
               VALUES ('prueba2@prueba2.com', 'pruebelio JR.', 'mcPrueba', NOW(), NOW())`;

const mostrarUsuarios = `SELECT * FROM "Users"`;

// var nombres  = client.query(query, (err, res) => {
//   if (err) {
//       console.error(err);
//       return;
//   }
//   for (let row of res.rows) {
//     console.log(row);
// }
//   var view_data = JSON.stringify(res);
//   app.render('pages/index.ejs',{ view_data:'view_data'})
//   client.end();
// });

// client.query(mostrarUsuarios, (err, resp) => {
//   if (err) {
//       console.error(err);
//       return;
//   }
//   for (let row of resp.rows) {
//     console.log(row);
// }
//   var view_data = JSON.stringify(resp.rows);
//   var obj = JSON.parse(view_data)
//   console.log(obj[2]["fName"]);
//   res.render('pages/index.ejs', {obj: obj})

// });
/* <h1>Nombre: <%= obj[0]["fName"] %></h1>
    <h2>Apellido: <%= obj[0]["lName"] %></h2>
    <h3>email: <%= obj[0]["email"] %></h3> */



    

    

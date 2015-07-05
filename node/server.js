// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express  = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-node-js
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(allowCrossDomain);


var port = process.env.PORT || 8081;        // set our port

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/timeline'); // connect to our database


var Event = require('./app/models/event');

var router = express.Router();     

router.use(function(req, res, next) {
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});


router.route('/events')

  .post(function(req, res) {
      
      var event = new Event();      
      event.name = req.body.name;  
      event.type = req.body.type;  
      event.startDate = req.body.startDate;  
      event.endDate = req.body.endDate;  
      event.details = req.body.details;  

      event.save(function(err) {
          if(err) {
            res.send(err);
          }
          console.log("post method called");
          res.json({ message: 'Event created!', event: event });
      });
      
  })
  
  .get(function(req, res) {
      Event.find(function(err, events) {
          if(err) {
            res.send(err);
          }
          //necessary with middleware?
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With");
          console.log("get method called");
          res.json(events);
      });
  });

    
router.route('/events/:event_id')

  .get(function(req, res) {
      Event.findById(req.params.event_id, function(err, event) {
          if(err) {
            res.send(err);
          }
          res.json(event);
      });
  })
  
  .put(function(req, res) {

      Event.findById(req.params.event_id, function(err, event) {

          if(err) {
            res.send(err);
          }

          event.name = req.body.name;  
          event.type = req.body.type;  
          event.startDate = req.body.startDate;  
          event.endDate = req.body.endDate;  
          event.details = req.body.details; 

          event.save(function(err) {
              if(err) {
                res.send(err);
              }

              res.json({ message: 'Event updated!' });
          });

      });
  })
  
  .delete(function(req, res) {
      Event.remove({
          _id: req.params.event_id
      }, function(err, event) {
          if(err) {
            res.send(err);
          }

          res.json({ message: 'Event successfully deleted' });
      });
  });

    
app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);































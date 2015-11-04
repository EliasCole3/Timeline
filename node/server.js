




var nomo = require('node-monkey').start();
var express  = require('express');       
var app = express();                
var bodyParser = require('body-parser');
var url = "mongodb://localhost:27017/timeline";
var mongoClient = require("mongodb").MongoClient;
var fs = require('fs');
var stringy = require('stringy');

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

var port = process.env.PORT || 8081;      
var mongoose = require('mongoose');
var Event = require('./app/models/event');
var router = express.Router();

mongoose.connect(url, function(err) {
  if (err) throw err;
}); 


router.use(function(req, res, next) {
    console.log('Something is happening.');
    // console.log("mongoose.connection.readyState: " + mongoose.connection.readyState);
    
    // make sure we go to the next routes and don't stop here
    next(); 
});

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});


router.route('/events')

  .post(function(req, res) {
      
    abc.getAndUpdateCounter(function(eventId) {
      
      var event = new Event();

      //hacks to get to the payload data, 11.04.15
      var eventData
      for(var prop in req.body) {
        eventData = prop
      }
      eventData = JSON.parse(eventData)


      event.eventId = eventId;

      // event.name = req.body.name;
      // event.type = req.body.type;
      // event.startDate = req.body.startDate;
      // event.endDate = req.body.endDate;
      // event.details = req.body.details;

      event.name = eventData.name;
      event.type = eventData.type;
      event.startDate = eventData.startDate;
      event.endDate = eventData.endDate;
      event.details = eventData.details;

      event.save(function(err) {
          if(err) {
            res.send(err);
          }
          // console.log("post method called");
          res.json({ message: 'Event created!', event: event });
      });
      
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
          // console.log("get method called");
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
      
      // Event.findById(req.params.event_id, function(err, event) { //get the info from the url
      Event.findById(req.body._id, function(err, event) { //get the info from the body of the request

          if(err) {
            err["extra"] = "first error";
            res.send(err);
          }

          //hacks to get to the payload data, 11.04.15
          var eventData
          for(var prop in req.body) {
            eventData = prop
          }
          eventData = JSON.parse(eventData)

          event.name = eventData.name;
          event.type = eventData.type;
          event.startDate = eventData.startDate;
          event.endDate = eventData.endDate;
          event.details = eventData.details;

          // event.name = req.body.name;  
          // event.type = req.body.type;  
          // event.startDate = req.body.startDate;  
          // event.endDate = req.body.endDate;  
          // event.details = req.body.details; 

          event.save(function(err) {
              if(err) {
                err["extra"] = "second error";
                res.send(err);
              }

              res.json({ message: 'Event updated!' , newObj: event});
              // res.send({"req": req, "res": res});
              // res.send(JSON.parse(stringy.stringify(req))); //works
              // res.send(req.body);
              // res.send(req.headers);
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


var abc = {
  
  getAndUpdateCounter: function(callback) {

    mongoClient.connect(url, function(err, db) {
      
      //if connecting failed
      if(err) {
        console.log(err);
      } else {
      
        // console.log("Connected correctly to server");
        
        var collection = db.collection('counters');
        
        //find the document that has the eventId record
        collection.find({
          eventId: {
            $exists: true
          }
        }).toArray(function(err, docs) {
          
          //if the document containing eventId couldn't be found
          if(err) {
            console.log(err);
          } else {
            
            // console.log("docs: ")
            // console.log(docs)

            //get the eventId
            var eventId = docs[0].eventId;
            var newEventId = eventId + 1;
            
            //update the eventId to eventId++ for next time
            var search  = { eventId: eventId };
            var update = { $set: { eventId : newEventId } };
            collection.update(search, update, function(err, result) {

              //close the connection and continue process the callback to continue with execution
              db.close();
              callback(eventId);
            });
            
          }
        });
      
      }
      
    });

  },
  
};


// var eventId = abc.getAndUpdateCounter();
// console.log("eventId at the end: " + eventId);

// console.log("eventId at the end: " + abc.getAndUpdateCounter());

// abc.getAndUpdateCounter(function(eventId) {
  // console.log("eventId at the end: " + eventId);
// });






















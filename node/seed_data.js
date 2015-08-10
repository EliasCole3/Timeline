var MongoClient = require("mongodb").MongoClient;

var url = "mongodb://localhost:27017/timeline";

MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");

  insertDocuments(db, function() {
    db.close();
  });

});

var insertDocuments = function(db, callback) {
  
  var collection = db.collection('events');
  
  var eventsToInsert = [];
        
  for(var i = 1; i <= 30; i++) {
    var event = {
      eventId: i,
      name: "eventname" + i,
      type: "type" + abc.getRandomInt(1,4),
      startDate: "2015-08-0" + abc.getRandomInt(1,9),
      endDate: "2015-08-" + abc.getRandomInt(20,30),
      details: "details" + i,
    };
    eventsToInsert.push(event);
  }
  
  collection.insert(eventsToInsert, function(error, result) {
    if(error) {
      console.log(error);
    }
    
    //@todo: set the eventId counter to the number of inserted events + 1
    
    callback(result);
  });
}

var abc = {
  
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
};
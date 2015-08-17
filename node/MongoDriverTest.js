var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");

// var url = "mongodb://localhost:27017/timeline";
var url = "mongodb://bilbo:baggins@ds061641.mongolab.com:61641/test1";

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  // db.close();
  
  // insertDocuments(db, function() {
    // db.close();
  // });

  // updateDocument(db, function() {
    // db.close();
  // });
});

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('events');
  // Insert some documents
  
  var event1 = {
    eventId: 1,
    name: "eventname1",
    type: "type1",
    startDate: "2015-07-01",
    endDate: "2015-07-01",
    details: "details1",
  };

  var event2 = {
    eventId: 2,
    name: "eventname2",
    type: "type2",
    startDate: "2015-07-01",
    endDate: "2015-07-01",
    details: "details",
  };
  
  collection.insert([event1, event2], function(err, result) {
    assert.equal(err, null);
    assert.equal(2, result.result.n);
    assert.equal(2, result.ops.length);
    console.log("Inserted 2 documents into the document collection");
    callback(result);
  });
}

var updateDocument = function(db, callback) {
  var collection = db.collection('events');
  collection.update({ eventId : 2 }
    , { $set: { eventId : 42 } }, function(err, result) {
    callback(result);
  });  
}


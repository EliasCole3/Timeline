(function() {
  
  
$(function(){
  abc.initialize();
});


/*
To do 

Design
 - Color scheme
 - Layout

Functionality
 - All CRUD actions hooked up
 
Other
 - Dependency manager
 - Explore DynaTable

*/

var abc = {
    
  initialize: function() {
    
    abc.assignHandlerEventCreateButton();
    
    abc.retrieveEvents().then(function() {
      abc.createTimeline();
      abc.createDynaTable();
      abc.assignHandlerEventReadButtons();
      abc.assignHandlerEventUpdateButtons();
      abc.assignHandlerEventDeleteButtons();
    });
    
    abc.loadTestData();
    
  },
  
  assignHandlerEventCreateButton: function() {
    $("#event-create-button").click(function() {
      var headerText = "Creating New Event";
      var formHtml = abc.getEventCreateForm();
      abc.showModal(headerText, formHtml);
      abc.assignHandlerEventCreateForm();
    });
  },
  
  assignHandlerEventReadButtons: function() {
    $(".model-read").click(function() {
      console.log($(this).attr("event-id"));
    });
  },
  
  assignHandlerEventUpdateButtons: function() {
    $(".model-update").click(function() {
      console.log($(this).attr("event-id"));
    });
  },
  
  assignHandlerEventDeleteButtons: function() {
    $(".model-delete").click(function() {
      console.log($(this).attr("event-id"));
    });
  },
  
  getEventCreateForm: function() {
    var htmlString = "" + 
      "<label>Name</label><input id='name' type='text' class='form-control' /><br />" + 
      "<label>Type</label><input id='type' type='text' class='form-control' /><br />" + 
      "<label>Start Date</label><input id='start-date' type='date' class='form-control' /><br />" + 
      "<label>End Date</label><input id='end-date' type='date' class='form-control' /><br />" + 
      "<label>Details</label><textarea id='start-date' class='form-control' style='resize:vertical;' ></textarea><br />" + 
      "<button id='submit' class='btn btn-lg form-control' type='submit'>Submit</button>";
    return htmlString;
  },
  
  assignHandlerEventCreateForm: function() {
    
    $("#submit").click(function() {
      
      var name = $("#name").val();
      var type = $("#type").val();
      var startDate = $("#start-date").val();
      var endDate = $("#end-date").val();
      var details = $("#details").val();
      
      var dataForAjax = JSON.stringify({
        "name" : name,
        "type" : type,
        "startDate" : startDate,
        "endDate" : endDate,
        "details" : details,
      });
     
      $.ajax({
        type: "POST",
        url: abc.apiurl,
        data: dataForAjax,
        contentType: "application/json; charset=utf-8",
        success: function(data, status, jqXHR) {
          $("#modal").modal("hide");
          console.log(data);
        },
        error: function(jqXHR, status) {
          console.log("error");
          console.log(jqXHR);
        }
      });
      
    });
    
  },
  
  showModal: function(headerText, formHtml) {
    $("#error-message-div").addClass("hide");
    $("#form-target").html(formHtml);
    $("#modal-header").html("<h4>" + headerText + "</h4>");
    $("#modal").modal("show");
  },
  
  createTimeline: function() {
    $("#timeline").html("");
    var container = document.getElementById("timeline");
    abc.timeline = new vis.Timeline(container);
    abc.timeline.setOptions(abc.timelineOptions);
    abc.createGroups();
    abc.timeline.setGroups(abc.timelineGroups);
    abc.createItems();
    abc.timeline.setItems(abc.timelineItems);
  },
  
  createGroups: function() {
    abc.timelineGroups = new vis.DataSet();
    for (var i = 1; i <= 4; i++) {
      abc.timelineGroups.add({id: i, content: "group number " + i});
    }
  },

  createItems: function() {
    
    abc.timelineItems = new vis.DataSet();
    
    abc.events.forEach(function(event) {
      
      abc.timelineItems.add({
        id: event.eventId,
        group: 1,
        content: event.name,
        start: moment(event.startDate),
        // end: moment(event.startDate),
        type: "box"
      });
      
    });
  },
  
  
  
  
  
  createDynaTable: function() {

    var data = deepcopy(abc.events);
    
    data.forEach(function(event) {
      var htmlString = "";
      
      htmlString = "" + 
      "<button class='btn btn-default model-delete' id='delete-" + event.eventId + "' event-id='" + event.eventId + "'>" + 
      "<i class='glyphicon glyphicon-trash'></i> </button>" +
      "<button class='btn btn-default model-update' id='update-" + event.eventId + "' event-id='" + event.eventId + "'>" +
      "<i class='glyphicon glyphicon-edit'></i> </button>" +
      "<button class='btn btn-default model-read' data-popup-target='#View-Popup' id='read-" + event.eventId + "' event-id='" + event.eventId + "'>" +
      "<i class='glyphicon glyphicon-eye-open'></i> </button>";
   
      event["actions"] = htmlString;
      
    });

      $("#dynatable").dynatable({
        dataset: {
          // records: abc.events
          records: data
        },
        features: {
          paginate: true,
          recordCount: true,
          sorting: true,
          search: true
        },
      });

      console.log(data);
    
  },
  
  loadTestData: function() {
    
    var eventsToInsert = [];
        
    for(var i = 1; i <= 30; i++) {
      var event = {
        eventId: i,
        name: "eventname" + i,
        type: "type" + abc.getRandomInt(1,4),
        startDate: "2015-07-0" + abc.getRandomInt(1,14),
        endDate: "2015-07-0" + abc.getRandomInt(20,30),
        details: "details" + i,
      };
      eventsToInsert.push(event);
    }
    
    console.log(eventsToInsert);
    
  },
  
  
  
  
  
  
  retrieveEvents: function() {
    return $.ajax({
      type: "GET",
      url: abc.apiurl,
      success: function(data, status, jqXHR) {
        console.log(data);
        abc.events = data;
      },
      error: function(jqXHR, status) {
        console.log(jqXHR);
      }
    });
  },
  
    /**
   * http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  
  timeline: "",

  events: [],
  
  apiurl: "http://localhost:8081/api/events",
  
  timelineOptions: {
        maxHeight: "2000px", 
        min: "2010-01-01",
        max: "2020-01-01",
        editable: {updateGroup: true},
        start: "2015-06-01",
  },
  
  timelineGroups: "",
  
  timelineItems: [],
  
  
  
};











































  
})();
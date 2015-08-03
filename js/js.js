(function() {
  
$(function() {
  abc.initialize();
  // ebot.updateDocumentation(abc);
});


/*
To do 

Design
 - Color scheme
 - Layout

Functionality
 - Timeline filtering
 
Other
 - Dependency manager
 - Explore DynaTable
 - Clean up server.js
 - Hotkeys
 
 Bugs
 - DynaTable search disables RUD button handlers...

*/

/**
 * initialize()
 * reset()
 * assignHandlersRUDButtons()
 * assignHandlerEventCreateButton()
 * assignHandlersEventReadButtons()
 * assignHandlersEventUpdateButtons()
 * assignHandlersEventDeleteButtons()
 * getEventCreateForm()
 * getEventUpdateForm()
 * getEventDeleteForm()
 * assignHandlersEventCreateForm()
 * assignHandlersEventUpdateForm()
 * assignHandlersEventDeleteForm()
 * assignStackToggleHandler()
 * assignRedrawHandler()
 * fillTimelineFilterSelect()
 * createTimeline()
 * createGroups()
 * createItems()
 * createDynaTable()
 * resetDynaTableHtml()
 * retrieveEvents()
 * timeline
 * events
 * apiurl
 * getTimelineOptions()
 * timelineGroups
 * timelineItems
 * dynaTable
 * isStacked
 * timelineMinHeight
 * timelineMaxHeight
 */
var abc = {
    
  initialize: function() {
    
    abc.assignHandlerEventCreateButton();
    abc.reset();
    abc.assignStackToggleHandler();
    abc.assignRedrawHandler();
    
  },
  
  reset: function() {
    abc.retrieveEvents().then(function() {
      abc.createTimeline();
      abc.resetDynaTableHtml();
      abc.createDynaTable();
      abc.assignHandlersRUDButtons();
      abc.fillTimelineFilterSelect();
      abc.isPageLoad = false;
    });
  },
  
  assignHandlersRUDButtons: function() {
    abc.assignHandlersEventReadButtons();
    abc.assignHandlersEventUpdateButtons();
    abc.assignHandlersEventDeleteButtons();
  },
  
  assignHandlerEventCreateButton: function() {
    $("#event-create-button").click(function() {
      var headerText = "Creating New Event";
      var formHtml = abc.getEventCreateForm();
      ebot.showModal(headerText, formHtml);
      abc.assignHandlersEventCreateForm();
    });
  },
  
  assignHandlersEventReadButtons: function() {
    $(".model-read").click(function() {
      console.log($(this).attr("event-id"));
    });
  },
  
  assignHandlersEventUpdateButtons: function() {
    $(".model-update").click(function() {
      
      var eventId = +$(this).attr("event-id");
      
      var event = abc.events.filter(function(event) {
        return event.eventId === eventId;
      })[0]; 
      
      var headerText = "Updating Event: " + event.name;
      var formHtml = abc.getEventUpdateForm();
      ebot.showModal(headerText, formHtml);
      abc.assignHandlersEventUpdateForm(event);
      
    });
  },
  
  assignHandlersEventDeleteButtons: function() {
    $(".model-delete").click(function() {
      
      var eventId = +$(this).attr("event-id");
      
      var event = abc.events.filter(function(event) {
        return event.eventId === eventId;
      })[0]; 
      
      var headerText = "Are you sure you want to delete event: " + event.name + "?";
      var formHtml = abc.getEventDeleteForm();
      ebot.showModal(headerText, formHtml);
      abc.assignHandlersEventDeleteForm(event);
      
    });
  },
  
  getEventCreateForm: function() {
    var htmlString = "" + 
      "<label>Name</label><input id='name' type='text' class='form-control' /><br />" + 
      "<label>Type</label><input id='type' type='text' class='form-control' /><br />" + 
      "<label>Start Date</label><input id='start-date' type='date' class='form-control' /><br />" + 
      "<label>End Date</label><input id='end-date' type='date' class='form-control' /><br />" + 
      "<label>Details</label><textarea id='details' class='form-control' ></textarea><br />" + 
      "<button id='submit' class='btn btn-lg form-control' type='submit'>Submit</button>";
    return htmlString;
  },

  getEventUpdateForm: function() {
    var htmlString = "" + 
      "<label>Name</label><input id='name' type='text' class='form-control' /><br />" + 
      "<label>Type</label><input id='type' type='text' class='form-control' /><br />" + 
      "<label>Start Date</label><input id='start-date' type='date' class='form-control' /><br />" + 
      "<label>End Date</label><input id='end-date' type='date' class='form-control' /><br />" + 
      "<label>Details</label><textarea id='details' class='form-control' ></textarea><br />" + 
      "<button id='submit' class='btn btn-lg form-control' type='submit'>Submit</button>";
    return htmlString;
  },

  getEventDeleteForm: function() {
    var htmlString = "" + 
      "<button id='submit' class='btn btn-lg form-control' type='submit'>Yes</button>";
    return htmlString;
  },
  
  assignHandlersEventCreateForm: function() {
    
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
          abc.reset();
        },
        error: function(jqXHR, status) {
          console.log("error");
          console.log(jqXHR);
        }
      });
      
    });
    
  },
  
  assignHandlersEventUpdateForm: function(oldEvent) {
    
    //get old data and fill form
    $("#name").val(oldEvent.name);
    $("#type").val(oldEvent.type);
    $("#start-date").val(oldEvent.startDate);
    $("#end-date").val(oldEvent.endDate);
    $("#details").val(oldEvent.details);
    
    $("#submit").click(function() {

      var mongoId = oldEvent._id;
      var name = $("#name").val();
      var type = $("#type").val();
      var startDate = $("#start-date").val();
      var endDate = $("#end-date").val();
      var details = $("#details").val();
      
      var dataForAjax = JSON.stringify({
        "_id" : mongoId,
        "name" : name,
        "type" : type,
        "startDate" : startDate,
        "endDate" : endDate,
        "details" : details,
      });
      
      $.ajax({
        type: "PUT",
        url: abc.apiurl + "/" + oldEvent._id,
        data: dataForAjax,
        contentType: "application/json; charset=utf-8",
        success: function(data, status, jqXHR) {
          $("#modal").modal("hide");
          abc.reset();
          // abc.dynaTable.records.updateFromJson(abc.events);
        },
        error: function(jqXHR, status) {
          console.log("error");
          console.log(jqXHR);
        }
      });
      
    });
    
  },
  

  assignHandlersEventDeleteForm: function(event) {
    
    $("#submit").click(function() {

      $.ajax({
        type: "DELETE",
        url: abc.apiurl + "/" + event._id,
        success: function(data, status, jqXHR) {
          $("#modal").modal("hide");
          console.log(data);
          abc.reset();
        },
        error: function(jqXHR, status) {
          console.log("error");
          console.log(jqXHR);
        }
      });
      
    });
    
  },
  
  assignStackToggleHandler: function() {
    
    $("#stack-option").click(function() {
      var today = new Date();
      today = moment(today);
      abc.isStacked ? abc.isStacked = false : abc.isStacked = true;
      var options = {
        maxHeight: "400px", 
        min: "2010-1-1",
        max: today,
        editable: {updateGroup: true},
        orientation: "both",
        stack: abc.isStacked,
      };
      abc.timeline.setOptions(options);
      abc.timeline.redraw();
    });
    
  },
  
  assignRedrawHandler: function() {
    
    $("#redraw").click(function() {
      var today = new Date();
      today = moment(today);
      monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth()-1);
      
      var startRange = $("#range-start").val();
      var endRange = $("#range-end").val();
      var height = $("#height").val();
      abc.filterTimelineItems();

      if(startRange === "") {
        startRange = monthAgo;
      }
      
      if(endRange === "") {
        endRange = today;
      }

      if(height < abc.timelineMinHeight || height > abc.timelineMaxHeight) {
        height = 400;
        ebot.notify("Please choose a height between " + abc.timelineMinHeight + " and " + abc.timelineMaxHeight + "", 5000);
      }
      
      height = height + "px";
      
      var options = {
        height: height, 
        min: "2010-1-1",
        max: today,
        editable: {updateGroup: true},
        orientation: "both",
        stack: abc.isStacked,
      };
      
      abc.timeline.setItems(abc.timelineItems);
      abc.timeline.setOptions(options);
      abc.timeline.redraw();
      abc.timeline.setWindow(startRange, endRange);
    });
    
  },
  
  fillTimelineFilterSelect: function() {

    //this wasn't allowing chosen to be activated the first time.
    if(!abc.isPageLoad) {
      $("#timeline-filter-select").chosen("destroy");
    }
    
    var htmlString = "<option value=''></option>";
    
    var uniqueEventTypes = ebot.getUniqueFields(abc.events, "type");
    
    uniqueEventTypes.sort();
    
    uniqueEventTypes.forEach(function(eventType) {
      htmlString += "<option value='" + eventType + "'>" + eventType + "</option>";
    });
    
    $("#timeline-filter-select").html(htmlString);
    $("#timeline-filter-select").chosen(ebot.chosenOptions);
  },
  
  createTimeline: function() {
    $("#timeline").html("");
    var container = document.getElementById("timeline");
    abc.timeline = new vis.Timeline(container);
    abc.timeline.setOptions(abc.getTimelineOptions());
    abc.createGroups();
    abc.timeline.setGroups(abc.timelineGroups);
    abc.createTimelineItems();
    abc.timeline.setItems(abc.timelineItems);
  },
  
  createGroups: function() {
    abc.timelineGroups = new vis.DataSet();
    for (var i = 1; i <= 4; i++) {
      abc.timelineGroups.add({id: i, content: "group number " + i});
    }
  },

  createTimelineItems: function() {
    
    abc.timelineItems = new vis.DataSet();
    
    abc.events.forEach(function(event) {
      abc.addTimelineItem(event);
    });
    
  },
  
  filterTimelineItems: function() {
     abc.timelineItems = new vis.DataSet();
    
    var typeToFilterBy = $("#timeline-filter-select").val();

    abc.events.forEach(function(event) {

      if(typeToFilterBy === null || typeToFilterBy === "") { //null on page load, empty string after the select element is filled
        abc.addTimelineItem(event);
      } else if(typeToFilterBy === event.type) {
        abc.addTimelineItem(event);
      } else {
        // console.log("Event not added, didn't match type");
      }
      
    });
  },
  
  addTimelineItem: function(event) {
    abc.timelineItems.add({
      id: event.eventId,
      group: 1,
      content: event.name,
      start: moment(event.startDate),
      // end: moment(event.startDate),
      type: "box"
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
        records: data
      },
      features: {
        paginate: true,
        recordCount: true,
        sorting: true,
        search: true
      },
    });
    
    abc.dynaTable = $('#dynatable').data('dynatable');

  },
  
  resetDynaTableHtml: function() {
    
    $(".dynatable-wrapper").empty();
    
    var htmlString = "" + 
"<table class='table compact dynatable' id='dynatable'>" + 
"    <thead>" + 
"        <tr>" + 
"            <th>Event ID</th>" + 
"            <th>Name</th>" + 
"            <th>Type</th>" + 
"            <th>Start Date</th>" + 
"            <th>End Date</th>" + 
"            <th>Details</th>" + 
"            <th>Actions</th>" + 
"        </tr>" + 
"    </thead>" + 
"</table>";

    $(".dynatable-wrapper").append(htmlString);

  },
  
  retrieveEvents: function() {
    return $.ajax({
      type: "GET",
      url: abc.apiurl,
      success: function(data, status, jqXHR) {
        abc.events = data;
      },
      error: function(jqXHR, status) {
        console.log(jqXHR);
      }
    });
  },

  timeline: "",

  events: [],
  
  apiurl: "http://localhost:8081/api/events",

  getTimelineOptions: function() { //this has to be a function because it references one of it's own properties
    return {
      maxHeight: abc.timelineMaxHeight, 
      height: "400px",
      min: "2010-01-01",
      max: "2020-01-01",
      editable: {updateGroup: true},
      start: "2015-06-28",
      end: "2015-07-10",
      orientation: "both",
    };
  },
  
  timelineGroups: "",
  
  timelineItems: [],
  
  dynaTable: {},
  
  isStacked: true,
  
  timelineMinHeight: 200,
  
  timelineMaxHeight: 2000,
  
  isPageLoad: true,
  
};






  
})();
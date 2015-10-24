(function() {
  
$(function() {
  abc.initialize();
  // ebot.updateDocumentation(abc);
});


/*
To do
 
 user validation
 filters
 deploy everything
 on event create/update, move window to event
 copy feature
 - Dependency manager
 - Clean up server.js
 - Hotkeys
 textured background for border too
 User created custom buttons
 Profiles
*/

/**
 * initialize()
 * reset()
 * assignHandlerEventCreateButton()
 * assignHandlersRUD()
 * getEventReadForm()
 * assignHandlersEventReadForm()
 * getEventCreateForm()
 * getEventUpdateForm()
 * getEventDeleteForm()
 * assignHandlersEventCreateForm()
 * assignHandlersEventUpdateForm()
 * assignHandlersEventDeleteFormSingle()
 * assignStackToggleHandler()
 * assignRedrawHandler()
 * fillTimelineFilterSelect()
 * createTimeline()
 * assignHandlersForTimeline()
 * createGroups()
 * createTimelineItems()
 * filterTimelineItems()
 * addTimelineItem()
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
 * isPageLoad
 * lastSelectedEventId
 * rudActionsVisible
 */
var abc = {

  initialize: function() {
    
    abc.assignHandlerEventCreateButton();
    abc.reset();
    abc.assignStackToggleHandler();
    abc.assignRedrawHandler();
    abc.assignHandlersRUD();
    abc.assignHandlersTimelineControls();
    abc.assignHandlersMacroButtons();
    abc.assignHandlersMacroButtonsWithDate();
    
    
  },
  
  reset: function() {
    
    abc.retrieveEvents().then(function() {
      abc.createTimeline();
      abc.assignHandlersForTimeline();
      abc.fillTimelineFilterSelect();
      abc.isPageLoad = false;
    });
    
  },
  
  assignHandlersTimelineControls: function() {
    
    $(".timeline-control").change(function() {
      abc.redrawTimeline();
    });
    
  },
  
  assignHandlerEventCreateButton: function() {
    
    $("#event-create-button").click(function() {
      var headerText = "Creating New Event";
      var formHtml = abc.getEventCreateForm();
      ebot.showModal(headerText, formHtml);
      abc.assignHandlersEventCreateForm();
    });
    
  },
  
  assignHandlersRUD: function() {
    
    $("#read").click(function() {
      var event = abc.events.filter(function(event) {
        return event.eventId === abc.lastSelectedEventId;
      })[0];
      
      var headerText = event.name;
      var formHtml = abc.getEventReadForm(event);
      ebot.showModal(headerText, formHtml);
      abc.assignHandlersEventReadForm(event);
    });
    
    $("#update").click(function() {
      var event = abc.events.filter(function(event) {
        return event.eventId === abc.lastSelectedEventId;
      })[0]; 
      
      var headerText = "Updating Event: " + event.name;
      var formHtml = abc.getEventUpdateForm();
      ebot.showModal(headerText, formHtml);
      abc.assignHandlersEventUpdateForm(event);
    });
    
    $("#delete").click(function() {
      
      if(abc.multipleEventsSelected) {
        var eventIds = abc.timeline.getSelection();
        
        var events = abc.events.filter(function(event) {
          return eventIds.indexOf(event.eventId) > -1;
        }); 
        
        var headerText = "Are you sure you want to delete these events?";
        var formHtml = abc.getEventDeleteForm();
        ebot.showModal(headerText, formHtml);
        abc.assignHandlersEventDeleteFormMultiple(events); 
      } else {
        var event = abc.events.filter(function(event) {
          return event.eventId === abc.lastSelectedEventId;
        })[0]; 
        
        var headerText = "Are you sure you want to delete event: " + event.name + "?";
        var formHtml = abc.getEventDeleteForm();
        ebot.showModal(headerText, formHtml);
        abc.assignHandlersEventDeleteFormSingle(event); 
      }
      
    });

  },
  
  getEventReadForm: function(event) {
    
    var htmlString = "";
    
    for(prop in event) {
      htmlString += prop + ": " + event[prop] + "<br />";
    }
    
    return htmlString;
    
  },
  
  assignHandlersEventReadForm: function(event) {
    return;
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
  

  assignHandlersEventDeleteFormSingle: function(event) {
    
    $("#submit").click(function() {
      $.when(abc.getDeleteDeferred(event)).done(function() {
        ebot.notify("event successfully deleted!");
        $("#actions").hide();
        abc.rudActionsVisible = false;
        abc.reset();
      });
    });
    
  },

  assignHandlersEventDeleteFormMultiple: function(events) {
    
    $("#submit").click(function() {
      var deferreds = [];
    
      events.forEach(function(event) {
        deferreds.push(
          abc.getDeleteDeferred(event)
        );
      });
      
      $.when.apply($, deferreds).done(function() {
        ebot.notify("all events successfully deleted!");
        $("#actions").hide();
        abc.rudActionsVisible = false;
        abc.reset();
      });
    });
    
  },
  
  getDeleteDeferred: function(event) {
    return $.ajax({
        type: "DELETE",
        url: abc.apiurl + "/" + event._id,
        success: function(data, status, jqXHR) {
          $("#modal").modal("hide");
          console.log(data);
        },
        error: function(jqXHR, status) {
          console.log("error");
          console.log(jqXHR);
        }
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
        max: "2020-01-01",
        editable: {updateGroup: true},
        orientation: "both",
        stack: abc.isStacked,
      };
      abc.timeline.setOptions(abc.getTimelineOptions());
      abc.timeline.redraw();
    });
    
  },
  
  assignRedrawHandler: function() {
    
    $("#redraw").click(function() {
      abc.redrawTimeline();
    });
    
  },
  
  redrawTimeline: function() {
    
    var today = new Date();
    today = moment(today);
    monthAgo = new Date();
    monthForward = new Date();
    monthAgo.setMonth(monthAgo.getMonth()-1);
    monthForward.setMonth(monthForward.getMonth()+1);
    
    var startDate = $("#range-start").val();
    var endDate = $("#range-end").val();
    var height = $("#height").val();
    abc.filterTimelineItems();

    if(startDate === "") {
      startDate = monthAgo;
    }
    
    if(endDate === "") {
      endDate = monthForward;
    }

    if(height < abc.timelineMinHeight || height > abc.timelineMaxHeight) {
      height = 400;
      ebot.notify("Please choose a height between " + abc.timelineMinHeight + " and " + abc.timelineMaxHeight + "", 5000);
    }
    
    height = height + "px";
    
    abc.timelineOptions.height = height;
    
    abc.timeline.setItems(abc.timelineItems);
    abc.timeline.setOptions(abc.getTimelineOptions());
    abc.timeline.redraw();
    abc.timeline.setWindow(startDate, endDate);
    
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
    
    // abc.createGroups();
    // abc.timeline.setGroups(abc.timelineGroups);
    
    abc.createTimelineItems();
    abc.timeline.setItems(abc.timelineItems);
    
  },
  
  assignHandlersForTimeline: function() {
    
    abc.timeline.on("select", function (properties) {
      //the first time an event is selected, show RUD actions
      if(!abc.rudActionsVisible) {
        $("#actions").show(ebot.showOptions);
        abc.rudActionsVisible = true;
      }
      
      abc.multipleEventsSelected = false;
      
      if(properties.items.length > 1) abc.multipleEventsSelected = true;
      
      if(abc.multipleEventsSelected) {
        abc.disableReadButton();
        abc.disableUpdateButton();
        abc.changeDeleteButtonMultiple();
        var selectedIds = properties.items; //alternatively: abc.timeline.getSelection();
      } else {
        var index = properties.items.length - 1;
        abc.lastSelectedEventId = properties.items[index];
        abc.enableReadButton();
        abc.enableUpdateButton();
        abc.changeDeleteButtonSingle();
      }
      
    });
    
  },
  
  enableReadButton: function() {
    $("#read").removeClass("disabled");
  },

  disableReadButton: function() {
    $("#read").addClass("disabled");
  },
  
  enableUpdateButton: function() {
    $("#update").removeClass("disabled");
  },
  
  disableUpdateButton: function() {
    $("#update").addClass("disabled");
  },
  
  changeDeleteButtonSingle: function() {
    $("#delete").text("Delete");
    $("#actions").addClass("actions-single-event").removeClass("actions-multiple-events");
  },
  
  changeDeleteButtonMultiple: function() {
    $("#delete").text("Delete All");
    $("#actions").removeClass("actions-single-event").addClass("actions-multiple-events");
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
  
  assignHandlersMacroButtons: function() {
    $(".macro-button").click(function(e) {
      var button = $(e.currentTarget)
      var name = button.attr("macro-name")
      var type = button.attr("macro-type")
      var today = moment().format("YYYY-MM-DD")
      
      var dataForAjax = JSON.stringify({
        "name" : name,
        "type" : type,
        "startDate" : today,
        "endDate" : "",
        "details" : "",
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
  
  assignHandlersMacroButtonsWithDate: function() {
    $(".macro-button-with-date").click(function(e) {
      var button = $(e.currentTarget)
      var name = button.attr("macro-name")
      var type = button.attr("macro-type")
      var date = moment($("#date-for-macro-buttons").val()).format("YYYY-MM-DD")
      
      var dataForAjax = JSON.stringify({
        "name" : name,
        "type" : type,
        "startDate" : date,
        "endDate" : "",
        "details" : "",
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

  timeline: "",

  events: [],
  
  apiurl: "http://localhost:8081/api/events",
  // apiurl: "http://192.241.203.33:8081/api/events",

  getTimelineOptions: function() { //this has to be a function because it references one of it's own properties

    var options = deepcopy(abc.timelineOptions);
    options.maxHeight = abc.timelineMaxHeight;
    options.minHeight = abc.timelineMinHeight;
    options.stack = abc.isStacked;
    options.start = moment().subtract(2, 'weeks').format("YYYY-MM-DD")
    options.end = moment().add(1, 'weeks').format("YYYY-MM-DD")
    return options;

  },
  
  timelineOptions: {
    height: "400px",
    min: "2010-01-01",
    max: "2020-01-01",
    editable: {updateGroup: true},
    start: "2015-08-1",
    end: "2015-09-1",
    orientation: "both",
    multiselect: true,
  },
  
  timelineGroups: "",
  
  timelineItems: [],
  
  dynaTable: {},
  
  isStacked: true,
  
  timelineMinHeight: 200,
  
  timelineMaxHeight: 2000,
  
  isPageLoad: true,
  
  lastSelectedEventId: 0,
  
  rudActionsVisible: false,
  
  multipleEventsSelected: false,
  

};





  
})();
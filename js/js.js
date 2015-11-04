"use strict";

$(function () {
  abc.initialize();
  // ebot.updateDocumentation(abc)
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
 * handlerEventCreateButton()
 * handlersRUD()
 * getEventReadForm()
 * handlersEventReadForm()
 * getEventCreateForm()
 * getEventUpdateForm()
 * getEventDeleteForm()
 * handlersEventCreateForm()
 * handlersEventUpdateForm()
 * handlersEventDeleteFormSingle()
 * assignStackToggleHandler()
 * assignRedrawHandler()
 * fillTimelineFilterSelect()
 * createTimeline()
 * handlersForTimeline()
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

  initialize: function initialize() {
    abc.handlerEventCreateButton();
    abc.reset();
    abc.assignStackToggleHandler();
    abc.assignRedrawHandler();
    abc.handlersRUD();
    abc.handlersTimelineControls();
    abc.handlersMacroButtons();
    abc.handlersMacroButtonsWithDate();
  },

  reset: function reset() {
    abc.retrieveEvents().then(function () {
      abc.createTimeline();
      abc.handlersForTimeline();
      abc.fillTimelineFilterSelect();
      abc.isPageLoad = false;
    });
  },

  handlersTimelineControls: function handlersTimelineControls() {
    $(".timeline-control").change(function () {
      abc.redrawTimeline();
    });
  },

  handlerEventCreateButton: function handlerEventCreateButton() {
    $("#event-create-button").click(function () {
      var headerText = "Creating New Event";
      var formHtml = abc.getEventCreateForm();
      ebot.showModal(headerText, formHtml);
      abc.handlersEventCreateForm();
    });
  },

  handlersRUD: function handlersRUD() {
    $("#read").click(function () {
      var event = abc.getEvent(abc.lastSelectedEventId);
      var headerText = event.name;
      var formHtml = abc.getEventReadForm(event);
      ebot.showModal(headerText, formHtml);
    });

    $("#update").click(function () {
      var event = abc.getEvent(abc.lastSelectedEventId);
      var headerText = "Updating Event: " + event.name;
      var formHtml = abc.getEventUpdateForm();
      ebot.showModal(headerText, formHtml);
      abc.handlersEventUpdateForm(event);
    });

    $("#delete").click(function () {
      if (abc.multipleEventsSelected) {
        (function () {
          var eventIds = abc.timeline.getSelection();

          var events = abc.events.filter(function (event) {
            return eventIds.indexOf(event.eventId) > -1;
          });

          var headerText = "Are you sure you want to delete these events?";
          var formHtml = abc.getEventDeleteForm();
          ebot.showModal(headerText, formHtml);
          abc.handlersEventDeleteFormMultiple(events);
        })();
      } else {
        var _event = abc.getEvent(abc.lastSelectedEventId);
        var headerText = "Are you sure you want to delete event: " + _event.name + "?";
        var formHtml = abc.getEventDeleteForm();
        ebot.showModal(headerText, formHtml);
        abc.handlersEventDeleteFormSingle(_event);
      }
    });
  },

  getEventReadForm: function getEventReadForm(event) {
    var htmlString = "";

    for (prop in event) {
      htmlString += prop + ": " + event[prop] + "<br />";
    }

    return htmlString;
  },

  getEventCreateForm: function getEventCreateForm() {
    var htmlString = "<label>Name</label><input id='name' class='form-control' /><br />\n      <label>Type</label><input id='type' class='form-control' /><br />\n      <label>Start Date</label><input id='start-date' type='date' class='form-control' /><br />\n      <label>End Date</label><input id='end-date' type='date' class='form-control' /><br />\n      <label>Details</label><textarea id='details' class='form-control' ></textarea><br />\n      <button id='submit' class='btn btn-lg form-control' type='submit'>Submit</button>";

    return htmlString;
  },

  getEventUpdateForm: function getEventUpdateForm() {
    var htmlString = "<label>Name</label><input id='name' class='form-control' /><br />\n      <label>Type</label><input id='type' class='form-control' /><br />\n      <label>Start Date</label><input id='start-date' type='date' class='form-control' /><br />\n      <label>End Date</label><input id='end-date' type='date' class='form-control' /><br />\n      <label>Details</label><textarea id='details' class='form-control' ></textarea><br />\n      <button id='submit' class='btn btn-lg form-control' type='submit'>Submit</button>";

    return htmlString;
  },

  getEventDeleteForm: function getEventDeleteForm() {
    return "<button id='submit' class='btn btn-lg form-control' type='submit'>Yes</button>";
  },

  handlersEventCreateForm: function handlersEventCreateForm() {
    $("#submit").click(function () {

      var name = $("#name").val();
      var type = $("#type").val();
      var startDate = $("#start-date").val();
      var endDate = $("#end-date").val();
      var details = $("#details").val();

      var dataForAjax = JSON.stringify({
        "name": name,
        "type": type,
        "startDate": startDate,
        "endDate": endDate,
        "details": details
      });

      $.ajax({
        type: "POST",
        url: abc.apiurl,
        data: dataForAjax,
        contentType: "application/json charset=utf-8",
        success: function success(data, status, jqXHR) {
          $("#modal").modal("hide");
          console.log(data);
          abc.reset();
        },
        error: function error(jqXHR, status) {
          ebot.notify("error creating an event");
          console.log(jqXHR);
        }
      });
    });
  },

  handlersEventUpdateForm: function handlersEventUpdateForm(oldEvent) {

    //get old data and fill form
    $("#name").val(oldEvent.name);
    $("#type").val(oldEvent.type);
    $("#start-date").val(oldEvent.startDate);
    $("#end-date").val(oldEvent.endDate);
    $("#details").val(oldEvent.details);

    $("#submit").click(function () {
      var mongoId = oldEvent._id;
      var name = $("#name").val();
      var type = $("#type").val();
      var startDate = $("#start-date").val();
      var endDate = $("#end-date").val();
      var details = $("#details").val();

      var dataForAjax = JSON.stringify({
        "_id": mongoId,
        "name": name,
        "type": type,
        "startDate": startDate,
        "endDate": endDate,
        "details": details
      });

      $.ajax({
        type: "PUT",
        url: abc.apiurl + "/" + oldEvent._id,
        data: dataForAjax,
        contentType: "application/json charset=utf-8",
        success: function success(data, status, jqXHR) {
          $("#modal").modal("hide");
          abc.reset();
        },
        error: function error(jqXHR, status) {
          ebot.notify("error updating event: " + oldEvent.name);
          console.log(jqXHR);
        }
      });
    });
  },

  handlersEventDeleteFormSingle: function handlersEventDeleteFormSingle(event) {
    $("#submit").click(function () {
      $.when(abc.getDeleteDeferred(event)).done(function () {
        ebot.notify("event successfully deleted!");
        $("#actions").hide();
        abc.rudActionsVisible = false;
        abc.reset();
      });
    });
  },

  handlersEventDeleteFormMultiple: function handlersEventDeleteFormMultiple(events) {
    $("#submit").click(function () {
      var deferreds = [];

      events.forEach(function (event) {
        deferreds.push(abc.getDeleteDeferred(event));
      });

      $.when.apply($, deferreds).done(function () {
        ebot.notify("all events successfully deleted!");
        $("#actions").hide();
        abc.rudActionsVisible = false;
        abc.reset();
      });
    });
  },

  getDeleteDeferred: function getDeleteDeferred(event) {
    var deferred = $.ajax({
      type: "DELETE",
      url: abc.apiurl + "/" + event._id,
      success: function success(data, status, jqXHR) {
        $("#modal").modal("hide");
        console.log(data);
      },
      error: function error(jqXHR, status) {
        ebot.notify("error deleting event: " + event.name);
        console.log(jqXHR);
      }
    });

    return deferred;
  },

  assignStackToggleHandler: function assignStackToggleHandler() {
    $("#stack-option").click(function () {
      var today = moment();
      abc.isStacked ? abc.isStacked = false : abc.isStacked = true;
      var options = {
        maxHeight: "400px",
        min: "2010-1-1",
        max: "2020-01-01",
        editable: { updateGroup: true },
        orientation: "both",
        stack: abc.isStacked
      };
      abc.timeline.setOptions(abc.getTimelineOptions());
      abc.timeline.redraw();
    });
  },

  assignRedrawHandler: function assignRedrawHandler() {
    $("#redraw").click(function () {
      abc.redrawTimeline();
    });
  },

  redrawTimeline: function redrawTimeline() {
    var today = moment();
    var monthAgo = moment().subract(1, "months");
    var monthForward = moment().add(1, "months");

    var startDate = $("#range-start").val();
    var endDate = $("#range-end").val();
    var height = $("#height").val();
    abc.filterTimelineItems();

    if (startDate === "") {
      startDate = monthAgo;
    }

    if (endDate === "") {
      endDate = monthForward;
    }

    if (height < abc.timelineMinHeight || height > abc.timelineMaxHeight) {
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

  fillTimelineFilterSelect: function fillTimelineFilterSelect() {

    //this wasn't allowing chosen to be activated the first time.
    if (!abc.isPageLoad) {
      $("#timeline-filter-select").chosen("destroy");
    }

    var htmlString = "<option value=''></option>";

    var uniqueEventTypes = ebot.getUniqueFields(abc.events, "type").sort();

    uniqueEventTypes.forEach(function (eventType) {
      htmlString += "<option value='" + eventType + "'>" + eventType + "</option>";
    });

    $("#timeline-filter-select").html(htmlString);
    $("#timeline-filter-select").chosen(ebot.chosenOptions);
  },

  createTimeline: function createTimeline() {
    $("#timeline").html("");

    var container = document.getElementById("timeline");
    abc.timeline = new vis.Timeline(container);

    abc.timeline.setOptions(abc.getTimelineOptions());

    // abc.createGroups()
    // abc.timeline.setGroups(abc.timelineGroups)

    abc.createTimelineItems();
    abc.timeline.setItems(abc.timelineItems);
  },

  handlersForTimeline: function handlersForTimeline() {
    abc.timeline.on("select", function (properties) {

      //the first time an event is selected, show RUD actions
      if (!abc.rudActionsVisible) {
        $("#actions").show(ebot.showOptions);
        abc.rudActionsVisible = true;
      }

      abc.multipleEventsSelected = false;

      if (properties.items.length > 1) abc.multipleEventsSelected = true;

      if (abc.multipleEventsSelected) {
        abc.disableReadButton();
        abc.disableUpdateButton();
        abc.changeDeleteButtonMultiple();
        var selectedIds = properties.items; //alternatively: abc.timeline.getSelection()
      } else {
          var index = properties.items.length - 1;
          abc.lastSelectedEventId = properties.items[index];
          abc.enableReadButton();
          abc.enableUpdateButton();
          abc.changeDeleteButtonSingle();
        }
    });
  },

  enableReadButton: function enableReadButton() {
    $("#read").removeClass("disabled");
  },

  disableReadButton: function disableReadButton() {
    $("#read").addClass("disabled");
  },

  enableUpdateButton: function enableUpdateButton() {
    $("#update").removeClass("disabled");
  },

  disableUpdateButton: function disableUpdateButton() {
    $("#update").addClass("disabled");
  },

  changeDeleteButtonSingle: function changeDeleteButtonSingle() {
    $("#delete").text("Delete");
    $("#actions").addClass("actions-single-event").removeClass("actions-multiple-events");
  },

  changeDeleteButtonMultiple: function changeDeleteButtonMultiple() {
    $("#delete").text("Delete All");
    $("#actions").removeClass("actions-single-event").addClass("actions-multiple-events");
  },

  createGroups: function createGroups() {
    abc.timelineGroups = new vis.DataSet();
    for (var i = 1; i <= 4; i++) {
      abc.timelineGroups.add({ id: i, content: "group number " + i });
    }
  },

  createTimelineItems: function createTimelineItems() {
    abc.timelineItems = new vis.DataSet();

    abc.events.forEach(function (event) {
      abc.addTimelineItem(event);
    });
  },

  filterTimelineItems: function filterTimelineItems() {
    abc.timelineItems = new vis.DataSet();

    var typeToFilterBy = $("#timeline-filter-select").val();

    abc.events.forEach(function (event) {

      if (typeToFilterBy === null || typeToFilterBy === "") {
        //null on page load, empty string after the select element is filled
        abc.addTimelineItem(event);
      } else if (typeToFilterBy === event.type) {
        abc.addTimelineItem(event);
      } else {
        // console.log("Event not added, didn't match type")
      }
    });
  },

  addTimelineItem: function addTimelineItem(event) {
    abc.timelineItems.add({
      id: event.eventId,
      group: 1,
      content: event.name,
      start: moment(event.startDate),
      // end: moment(event.startDate),
      type: "box"
    });
  },

  retrieveEvents: function retrieveEvents() {
    return $.ajax({
      type: "GET",
      url: abc.apiurl,
      success: function success(data, status, jqXHR) {
        abc.events = data;
      },
      error: function error(jqXHR, status) {
        console.log(jqXHR);
      }
    });
  },

  handlersMacroButtons: function handlersMacroButtons() {
    $(".macro-button").click(function (e) {
      var button = $(e.currentTarget);
      var name = button.attr("macro-name");
      var type = button.attr("macro-type");
      var today = moment().format("YYYY-MM-DD");

      var dataForAjax = JSON.stringify({
        "name": name,
        "type": type,
        "startDate": today,
        "endDate": "",
        "details": ""
      });

      console.log(dataForAjax);

      $.ajax({
        type: "POST",
        url: abc.apiurl,
        data: dataForAjax,
        // contentType: "application/json charset=utf-8",
        contentType: "application/x-www-form-urlencoded",
        success: function success(data, status, jqXHR) {
          $("#modal").modal("hide");
          console.log(data);
          abc.reset();
        },
        error: function error(jqXHR, status) {
          console.log("error");
          console.log(jqXHR);
        }
      });
    });
  },

  handlersMacroButtonsWithDate: function handlersMacroButtonsWithDate() {
    $(".macro-button-with-date").click(function (e) {
      var button = $(e.currentTarget);
      var name = button.attr("macro-name");
      var type = button.attr("macro-type");
      var date = moment($("#date-for-macro-buttons").val()).format("YYYY-MM-DD");

      var dataForAjax = JSON.stringify({
        "name": name,
        "type": type,
        "startDate": date,
        "endDate": "",
        "details": ""
      });

      // abc.createEvent(dataForAjax).then(data => {
      //   $("#modal").modal("hide")
      //   console.log(data)
      //   abc.reset()
      // })

      $.ajax({
        type: "POST",
        url: abc.apiurl,
        data: dataForAjax,
        contentType: "application/json charset=utf-8",
        success: function success(data, status, jqXHR) {
          $("#modal").modal("hide");
          console.log(data);
          abc.reset();
        },
        error: function error(jqXHR, status) {
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

  getTimelineOptions: function getTimelineOptions() {
    //this has to be a function because it references one of it's own properties
    var options = deepcopy(abc.timelineOptions);
    options.maxHeight = abc.timelineMaxHeight;
    options.minHeight = abc.timelineMinHeight;
    options.stack = abc.isStacked;
    options.start = moment().subtract(2, 'weeks').format("YYYY-MM-DD");
    options.end = moment().add(1, 'weeks').format("YYYY-MM-DD");
    return options;
  },

  getEvent: function getEvent(eventId) {
    var event = abc.events.filter(function (event) {
      return event.eventId === eventId;
    })[0];

    return event;
  },

  createEvent: function createEvent(jsonData) {
    var deferred = $.ajax({
      type: "POST",
      url: abc.apiurl,
      data: jsonData,
      contentType: "application/json charset=utf-8",
      success: function success(data, status, jqXHR) {
        $("#modal").modal("hide");
        console.log(data);
        abc.reset();
      },
      error: function error(jqXHR, status) {
        ebot.notify("error creating an event");
        console.log(jqXHR);
      }
    }).promise();

    return deferred;
  },

  timelineOptions: {
    height: "400px",
    min: "2010-01-01",
    max: "2020-01-01",
    editable: { updateGroup: true },
    start: "2015-08-1",
    end: "2015-09-1",
    orientation: "both",
    multiselect: true
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

  multipleEventsSelected: false

};
//# sourceMappingURL=js.js.map

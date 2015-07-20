$(function(){
  abc.initialize();
});


/*
To do 

Design
 - Color scheme
 - Layout

Functionality
 - Datatable view of info and CRUD
 - All CRUD actions hooked up
 
Other

*/

var abc = {
    
  initialize: function() {
    
    abc.assignHandlerEventCreateButton();
    
    abc.retrieveEvents().then(function() {
      abc.createTimeline();
      abc.createDataTable();
    });
    
  },
  
  assignHandlerEventCreateButton: function() {
    $("#event-create-button").click(function() {
      var headerText = "Creating New Event";
      var formHtml = abc.getEventCreateForm();
      abc.showModal(headerText, formHtml);
      abc.assignHandlerForEventCreateForm();
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
  
  assignHandlerForEventCreateForm: function() {
    
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
    for (var i = 1; i < 10; i++) {
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
  
  
  
  
  
  createDataTable: function() {
    var modelTable;
    var columnNumber = -1;
    
    var columnDefs = [
      {
          "targets": [++columnNumber],
          "data": "eventId"
      },
      {
          "targets": [++columnNumber],
          "data": "name"
      },
      {
          "targets": [++columnNumber],
          "data": "type"
      },
      {
          "targets": [++columnNumber],
          "data": "startDate"
      },
      {
          "targets": [++columnNumber],
          "data": "endDate"
      },
      {
          "targets": [++columnNumber],
          "data": "details"
      },
      {
          "targets": [++columnNumber],
          "data": null,
          "render": function (data, type, row) {
             return "<button class='btn btn-default model-delete' id='delete-" + row.eventId + "' name='delete-for-" + row.name + "'>" + " <i class='glyphicon glyphicon-trash'></i> </button>" +"<button class='btn btn-default model-update' id='update-" + row.eventId + "' name='update-for-" + row.name + "'>" +"<i class='glyphicon glyphicon-edit'></i> </button>" +"<button class='btn btn-default model-view' data-popup-target='#View-Popup' id='view-" + row.eventId + "' name='view-for-" + row.name + "'>" +"<i class='glyphicon glyphicon-eye-open'></i> </button>";
          }
      },
      // {
        // "targets": [++columnNumber],
        // "data": "_id"
      // },
    ];
    
    // console.log(columnNumber);
    
    // var columnDefs = [
    
    // ];
    console.log(abc.events);
    
    var data = {
      "data": deepcopy(abc.events)
    };
    
    console.log(data);
    
    // data = JSON.parse(JSON.stringify(data));
    // data = JSON.stringify(data);
    
    console.log(data);
    
    data = {
    "data": [
              {
                  "_id": "5599a2fed4d419403cd844db",
                  "eventId": "1",
                  "name": "eventname1",
                  "type": "type1",
                  "startDate": "2015-07-01",
                  "endDate": "2015-07-01",
                  "details": "details1"
              },
              {
                  "_id": "5599a2fed4d419403cd844dc",
                  "eventId": "42",
                  "name": "eventname2",
                  "type": "type2",
                  "startDate": "2015-07-01",
                  "endDate": "2015-07-01",
                  "details": "details"
              },
              {
                  "_id": "5599bc09c00945b009000001",
                  "endDate": "2015-07-10",
                  "startDate": "2015-07-18",
                  "type": "asdf",
                  "name": "eventname1",
                  "eventId": "2",
                  "details": "asdf"
              }
          ]
      };

    modelTable = $("#data-table").DataTable({ //.dataTable = v1.9 instead of 1.10
      // "ajax": function(data, callback, settings) { //data and settings necessary for DataTables(don't know why)
        // $.get(abc.apiuri, function(response) {
          // //console.log(response);
          // console.log(data);
          // callback(response);
        // });
      // },
      // "ajax": JSON.stringify(abc.events),
      "ajax": data,
      // "sAjaxDataProp": "",
      "columnDefs": columnDefs,
      "dom": '<"#datatables-search"f>' +
        '<"#datatables-table"t>' +
        '<"#datatables-entries"l>' +
        '<"#datatables-info"i>' +
        '<"#datatables-pagination"p>'
    });
    
    console.log(data);
    
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











































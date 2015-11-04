
  
$(() => {
  abc.initialize()
  // ebot.updateDocumentation(abc)
})


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
let abc = {

  initialize: () => {
    abc.handlerEventCreateButton()
    abc.reset()
    abc.assignStackToggleHandler()
    abc.assignRedrawHandler()
    abc.handlersRUD()
    abc.handlersTimelineControls()
    abc.handlersMacroButtons()
    abc.handlersMacroButtonsWithDate()
  },
  
  reset: () => {
    abc.retrieveEvents().then(() => {
      abc.createTimeline()
      abc.handlersForTimeline()
      abc.fillTimelineFilterSelect()
      abc.isPageLoad = false
    })
  },
  
  handlersTimelineControls: () => {
    $(".timeline-control").change(() => {
      abc.redrawTimeline()
    })
  },
  
  handlerEventCreateButton: () => {
    $("#event-create-button").click(() => {
      let headerText = "Creating New Event"
      let formHtml = abc.getEventCreateForm()
      ebot.showModal(headerText, formHtml)
      abc.handlersEventCreateForm()
    })
  },
  
  handlersRUD: () => {
    $("#read").click(() => {
      let event = abc.getEvent(abc.lastSelectedEventId)
      let headerText = event.name
      let formHtml = abc.getEventReadForm(event)
      ebot.showModal(headerText, formHtml)
    })
    
    $("#update").click(() => {
      let event = abc.getEvent(abc.lastSelectedEventId)
      let headerText = `Updating Event: ${event.name}`
      let formHtml = abc.getEventUpdateForm()
      ebot.showModal(headerText, formHtml)
      abc.handlersEventUpdateForm(event)
    })
    
    $("#delete").click(() => {
      if(abc.multipleEventsSelected) {
        let eventIds = abc.timeline.getSelection()
        
        let events = abc.events.filter(event => {
          return eventIds.indexOf(event.eventId) > -1
        }) 
        
        let headerText = `Are you sure you want to delete these events?`
        let formHtml = abc.getEventDeleteForm()
        ebot.showModal(headerText, formHtml)
        abc.handlersEventDeleteFormMultiple(events) 
      } else {
        let event = abc.getEvent(abc.lastSelectedEventId)
        let headerText = `Are you sure you want to delete event: ${event.name}?`
        let formHtml = abc.getEventDeleteForm()
        ebot.showModal(headerText, formHtml)
        abc.handlersEventDeleteFormSingle(event) 
      }
    })
  },
  
  getEventReadForm: event => {
    let htmlString = ""
    
    for(prop in event) {
      htmlString += `${prop}: ${event[prop]}<br />`
    }
    
    return htmlString
  },
  
  getEventCreateForm: () => {
    let htmlString =
      `<label>Name</label><input id='name' class='form-control' /><br />
      <label>Type</label><input id='type' class='form-control' /><br />
      <label>Start Date</label><input id='start-date' type='date' class='form-control' /><br />
      <label>End Date</label><input id='end-date' type='date' class='form-control' /><br />
      <label>Details</label><textarea id='details' class='form-control' ></textarea><br />
      <button id='submit' class='btn btn-lg form-control' type='submit'>Submit</button>`

    return htmlString
  },

  getEventUpdateForm: () => {
    let htmlString =
      `<label>Name</label><input id='name' class='form-control' /><br />
      <label>Type</label><input id='type' class='form-control' /><br />
      <label>Start Date</label><input id='start-date' type='date' class='form-control' /><br />
      <label>End Date</label><input id='end-date' type='date' class='form-control' /><br />
      <label>Details</label><textarea id='details' class='form-control' ></textarea><br />
      <button id='submit' class='btn btn-lg form-control' type='submit'>Submit</button>`

    return htmlString
  },

  getEventDeleteForm: () => {
    return `<button id='submit' class='btn btn-lg form-control' type='submit'>Yes</button>`
  },
  
  handlersEventCreateForm: () => {
    $("#submit").click(() => {
      
      let name = $("#name").val()
      let type = $("#type").val()
      let startDate = $("#start-date").val()
      let endDate = $("#end-date").val()
      let details = $("#details").val()
      
      let dataForAjax = JSON.stringify({
        "name" : name,
        "type" : type,
        "startDate" : startDate,
        "endDate" : endDate,
        "details" : details,
      })
     
      $.ajax({
        type: "POST",
        url: abc.apiurl,
        data: dataForAjax,
        contentType: "application/json charset=utf-8",
        success: (data, status, jqXHR) => {
          $("#modal").modal("hide")
          console.log(data)
          abc.reset()
        },
        error: (jqXHR, status) => {
          ebot.notify("error creating an event")
          console.log(jqXHR)
        }
      })
      
    })
  },
  
  handlersEventUpdateForm: oldEvent => {
    
    //get old data and fill form
    $("#name").val(oldEvent.name)
    $("#type").val(oldEvent.type)
    $("#start-date").val(oldEvent.startDate)
    $("#end-date").val(oldEvent.endDate)
    $("#details").val(oldEvent.details)
    
    $("#submit").click(() => {
      let mongoId = oldEvent._id
      let name = $("#name").val()
      let type = $("#type").val()
      let startDate = $("#start-date").val()
      let endDate = $("#end-date").val()
      let details = $("#details").val()
      
      let dataForAjax = JSON.stringify({
        "_id" : mongoId,
        "name" : name,
        "type" : type,
        "startDate" : startDate,
        "endDate" : endDate,
        "details" : details,
      })
      
      $.ajax({
        type: "PUT",
        url: abc.apiurl + "/" + oldEvent._id,
        data: dataForAjax,
        contentType: "application/json charset=utf-8",
        success: (data, status, jqXHR) => {
          $("#modal").modal("hide")
          abc.reset()
        },
        error: (jqXHR, status) => {
          ebot.notify(`error updating event: ${oldEvent.name}`)
          console.log(jqXHR)
        }
      })
    })
  },
  

  handlersEventDeleteFormSingle: event => {
    $("#submit").click(() => {
      $.when(abc.getDeleteDeferred(event)).done(() => {
        ebot.notify("event successfully deleted!")
        $("#actions").hide()
        abc.rudActionsVisible = false
        abc.reset()
      })
    })
  },

  handlersEventDeleteFormMultiple: events => {
    $("#submit").click(() => {
      let deferreds = []
    
      events.forEach(event => {
        deferreds.push(
          abc.getDeleteDeferred(event)
        )
      })
      
      $.when.apply($, deferreds).done(() => {
        ebot.notify("all events successfully deleted!")
        $("#actions").hide()
        abc.rudActionsVisible = false
        abc.reset()
      })
    })
  },
  
  getDeleteDeferred: event => {
    let deferred = $.ajax({
        type: "DELETE",
        url: abc.apiurl + "/" + event._id,
        success: (data, status, jqXHR) => {
          $("#modal").modal("hide")
          console.log(data)
        },
        error: (jqXHR, status) => {
          ebot.notify(`error deleting event: ${event.name}`)
          console.log(jqXHR)
        }
      })

    return deferred
  },
  
  assignStackToggleHandler: () => {
    $("#stack-option").click(() => {
      let today = moment()
      abc.isStacked ? abc.isStacked = false : abc.isStacked = true
      let options = {
        maxHeight: "400px", 
        min: "2010-1-1",
        max: "2020-01-01",
        editable: {updateGroup: true},
        orientation: "both",
        stack: abc.isStacked,
      }
      abc.timeline.setOptions(abc.getTimelineOptions())
      abc.timeline.redraw()
    })
  },
  
  assignRedrawHandler: () => {
    $("#redraw").click(() => {
      abc.redrawTimeline()
    })
  },
  
  redrawTimeline: () => {
    let today = moment()
    let monthAgo = moment().subract(1, "months")
    let monthForward = moment().add(1, "months")
    
    let startDate = $("#range-start").val()
    let endDate = $("#range-end").val()
    let height = $("#height").val()
    abc.filterTimelineItems()

    if(startDate === "") {
      startDate = monthAgo
    }
    
    if(endDate === "") {
      endDate = monthForward
    }

    if(height < abc.timelineMinHeight || height > abc.timelineMaxHeight) {
      height = 400
      ebot.notify("Please choose a height between " + abc.timelineMinHeight + " and " + abc.timelineMaxHeight + "", 5000)
    }
    
    height = height + "px"
    abc.timelineOptions.height = height
    
    abc.timeline.setItems(abc.timelineItems)
    abc.timeline.setOptions(abc.getTimelineOptions())
    abc.timeline.redraw()
    abc.timeline.setWindow(startDate, endDate)
  },
  
  fillTimelineFilterSelect: () => {

    //this wasn't allowing chosen to be activated the first time.
    if(!abc.isPageLoad) {
      $("#timeline-filter-select").chosen("destroy")
    }
    
    let htmlString = `<option value=''></option>`
    
    let uniqueEventTypes = ebot.getUniqueFields(abc.events, "type").sort()
    
    uniqueEventTypes.forEach(eventType => {
      htmlString += `<option value='${eventType}'>${eventType}</option>`
    })
    
    $("#timeline-filter-select").html(htmlString)
    $("#timeline-filter-select").chosen(ebot.chosenOptions)
  },
  
  createTimeline: () => {
    $("#timeline").html("")
    
    let container = document.getElementById("timeline")
    abc.timeline = new vis.Timeline(container)
    
    abc.timeline.setOptions(abc.getTimelineOptions())
    
    // abc.createGroups()
    // abc.timeline.setGroups(abc.timelineGroups)
    
    abc.createTimelineItems()
    abc.timeline.setItems(abc.timelineItems)
  },
  
  handlersForTimeline: () => {
    abc.timeline.on("select", function (properties) {

      //the first time an event is selected, show RUD actions
      if(!abc.rudActionsVisible) {
        $("#actions").show(ebot.showOptions)
        abc.rudActionsVisible = true
      }
      
      abc.multipleEventsSelected = false
      
      if(properties.items.length > 1) abc.multipleEventsSelected = true
      
      if(abc.multipleEventsSelected) {
        abc.disableReadButton()
        abc.disableUpdateButton()
        abc.changeDeleteButtonMultiple()
        let selectedIds = properties.items //alternatively: abc.timeline.getSelection()
      } else {
        let index = properties.items.length - 1
        abc.lastSelectedEventId = properties.items[index]
        abc.enableReadButton()
        abc.enableUpdateButton()
        abc.changeDeleteButtonSingle()
      }
    })
  },
  
  enableReadButton: () => {
    $("#read").removeClass("disabled")
  },

  disableReadButton: () => {
    $("#read").addClass("disabled")
  },
  
  enableUpdateButton: () => {
    $("#update").removeClass("disabled")
  },
  
  disableUpdateButton: () => {
    $("#update").addClass("disabled")
  },
  
  changeDeleteButtonSingle: () => {
    $("#delete").text("Delete")
    $("#actions").addClass("actions-single-event").removeClass("actions-multiple-events")
  },
  
  changeDeleteButtonMultiple: () => {
    $("#delete").text("Delete All")
    $("#actions").removeClass("actions-single-event").addClass("actions-multiple-events")
  },
  
  createGroups: () => {
    abc.timelineGroups = new vis.DataSet()
    for (let i = 1; i <= 4; i++) {
      abc.timelineGroups.add({id: i, content: "group number " + i})
    }
  },

  createTimelineItems: () => {
    abc.timelineItems = new vis.DataSet()
    
    abc.events.forEach(event => {
      abc.addTimelineItem(event)
    })
  },
  
  filterTimelineItems: () => {
   abc.timelineItems = new vis.DataSet()
    
    let typeToFilterBy = $("#timeline-filter-select").val()

    abc.events.forEach(event => {

      if(typeToFilterBy === null || typeToFilterBy === "") { //null on page load, empty string after the select element is filled
        abc.addTimelineItem(event)
      } else if(typeToFilterBy === event.type) {
        abc.addTimelineItem(event)
      } else {
        // console.log("Event not added, didn't match type")
      }
      
    })
  },
  
  addTimelineItem: event => {
    abc.timelineItems.add({
      id: event.eventId,
      group: 1,
      content: event.name,
      start: moment(event.startDate),
      // end: moment(event.startDate),
      type: "box"
    })
  },
  
  retrieveEvents: () => {
    return $.ajax({
      type: "GET",
      url: abc.apiurl,
      success: (data, status, jqXHR) => {
        abc.events = data
      },
      error: (jqXHR, status) => {
        console.log(jqXHR)
      }
    })
  },
  
  handlersMacroButtons: () => {
    $(".macro-button").click(e => {
      let button = $(e.currentTarget)
      let name = button.attr("macro-name")
      let type = button.attr("macro-type")
      let today = moment().format("YYYY-MM-DD")
      
      let dataForAjax = JSON.stringify({
        "name" : name,
        "type" : type,
        "startDate" : today,
        "endDate" : "",
        "details" : "",
      })

      console.log(dataForAjax)
     
      $.ajax({
        type: "POST",
        url: abc.apiurl,
        data: dataForAjax,
        // contentType: "application/json charset=utf-8",
        contentType: "application/x-www-form-urlencoded",
        success: (data, status, jqXHR) => {
          $("#modal").modal("hide")
          console.log(data)
          abc.reset()
        },
        error: (jqXHR, status) => {
          console.log("error")
          console.log(jqXHR)
        }
      })
      
    })
  },
  
  handlersMacroButtonsWithDate: () => {
    $(".macro-button-with-date").click(e => {
      let button = $(e.currentTarget)
      let name = button.attr("macro-name")
      let type = button.attr("macro-type")
      let date = moment($("#date-for-macro-buttons").val()).format("YYYY-MM-DD")
      
      let dataForAjax = JSON.stringify({
        "name" : name,
        "type" : type,
        "startDate" : date,
        "endDate" : "",
        "details" : "",
      })

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
        success: (data, status, jqXHR) => {
          $("#modal").modal("hide")
          console.log(data)
          abc.reset()
        },
        error: (jqXHR, status) => {
          console.log("error")
          console.log(jqXHR)
        }
      })
      
    })
  },

  timeline: "",

  events: [],
  
  apiurl: "http://localhost:8081/api/events",
  // apiurl: "http://192.241.203.33:8081/api/events",

  getTimelineOptions: () => { //this has to be a function because it references one of it's own properties
    let options = deepcopy(abc.timelineOptions)
    options.maxHeight = abc.timelineMaxHeight
    options.minHeight = abc.timelineMinHeight
    options.stack = abc.isStacked
    options.start = moment().subtract(2, 'weeks').format("YYYY-MM-DD")
    options.end = moment().add(1, 'weeks').format("YYYY-MM-DD")
    return options
  },

  getEvent: eventId => {
    let event = abc.events.filter(event => {
      return event.eventId === eventId
    })[0]

    return event
  },

  createEvent: jsonData => {
    let deferred = $.ajax({
      type: "POST",
      url: abc.apiurl,
      data: jsonData,
      contentType: "application/json charset=utf-8",
      success: (data, status, jqXHR) => {
        $("#modal").modal("hide")
        console.log(data)
        abc.reset()
      },
      error: (jqXHR, status) => {
        ebot.notify("error creating an event")
        console.log(jqXHR)
      }
    }).promise()

    return deferred
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
  

}

var ebot = {
  
  shoutGlory: function() {
    alert("Glory! Glory!");
  },
  
  updateDocumentation: function(obj) {
    var output = "/**\n";
    for(member in obj) {
      if(typeof(obj[member]) === "function") {
        output += " * " + member + "()\n";
      } else {
        output += " * " + member + "\n";
      }
    }
    output += " */";
    console.log(output);
  },
  
  removeKeyFromArray: function(array, key) {
    if(typeof(key) === "number") {
      array.splice(i, 1);
      return array;
    } else if (typeof(key) === "string") {
      var i = array.indexOf(key);
      if(i !== -1) {
        array.splice(i, 1);
        return array;
      } else {
        alert("that key doesn't exist");
        return array;
      }
    } else {
      alert("remove takes a number or a string as a parameter");
      return array;
    }
  },
  
  retrieveModel: function(obj, name, queryString) { //expecting a camelcased plural name, e.g. blueFrogLegs
    if(typeof(queryString) === "undefined") queryString = "";
    
    return $.ajax({
      type: "GET",
      url: env.getApiUri() + "/" + name + queryString,
      success: function(data, status, jqXHR) {
        var nameUnderscored = name.underscore();
        obj[name] = data._embedded[nameUnderscored];
      },
      error: function(jqXHR, status) {
        console.log("retrieveModel() failed");
      }
    });
  },

  /**
   * Requires:
   * 
   * insertModalHtml()
   * 
   */
  showModal: function(headerText, formHtml) {
    $("#error-message-div").addClass("hide");
    $("#form-target").html(formHtml);
    $("#modal-header").html("<h4>" + headerText + "</h4>");
    $("#modal").modal("show");
  },

  /**
   * Requires: 
   * 
   * an element with id="modal"
   * 
   * any fields desired to be focused to have the class "first-field"
   * 
   */
  assignHandlerForModalShown: function() {
    //setting up the event handler, on modal show, focus the first field in the form
    $('#modal').on('shown.bs.modal', function (e) {
      //normal fields
      $(".first-field").focus();
      //chosen select elements
      $(".first-field").trigger("chosen:activate");
    });
  },
  
  /**
   * Requires:
   * 
   * .hide {
   *   display: none !important;
   * }
   * 
   * insertModalHtml()
   * 
   */
  appendErrorMessage: function(jqXHR, message) {
    $("#error-message-status").html(jqXHR.status);
    $("#error-message-status-text").html(jqXHR.statusText);

    if(arguments.length === 2) {
      $("#error-message").html(message + "<br />");
    } 
    
    var responseText = JSON.parse(jqXHR.responseText);
    
    if(typeof(responseText.validation_messages) !== "undefined") {
      $.each(responseText.validation_messages, function(index, element) {
        var indexPretty = index.replace("_id", ""); 
        indexPretty = indexPretty.replace(/_/g, " "); 
        $("#error-message-status-text").append("<br />" + indexPretty + ": " + "'" + element + "'");
      });
    }
    
    $("#error-message-div").removeClass("hide");
  },
  
  /**
   * Requires: 
   * 
   * an element with id="notifications"
   * 
   * #notifications {
   *   margin-left: auto;
   *   margin-right: auto;
   *   width: 70%;
   *   text-align: center;
   *   height: 20px;
   * }
   * 
   */
  notify: function(message, hideTime) {
    
    if(typeof(hideTime) !== "undefined") {
      hideTime = +hideTime;
    } else {
      hideTime = 3000;
    }
    
    $("#notifications").show(); //necessary?

    var rand = ebot.getRandomInt(0, 999999);
    htmlString = "<div id='falling-cherry-blossom-" + rand + "' style='display:hidden;'><label>" + message + "</label><br /></div>";
    $("#notifications").append(htmlString);
    $("#falling-cherry-blossom-" + rand).show(ebot.showOptions);
    
    setTimeout(function() {
      $("#falling-cherry-blossom-" + rand).hide(ebot.hideOptions);
    }, hideTime);

    setTimeout(function() {
      $("#falling-cherry-blossom-" + rand).remove();
    }, hideTime + 500);

  },
  
  //getting unique fields from one property given an array of objects
  getUniqueFields: function(arrayOfObjects, field) {
    uniqueFields = [];
    arrayOfObjects.forEach(function(element, index, array) {
      if($.inArray(element[field], uniqueFields) === -1) { //if no jquery, replace with indexOf()
        uniqueFields.push(element[field]);
      }
    });
    return uniqueFields;
  },
  
  scrollUp: function() {
    $("html, body").animate({
      scrollTop: 0
    }, 300); 
  },

  //stolen from SO: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  numberWithCommas: function(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  },
  
//  if(el[name].length === 0) {
//    var deferred = el.retrieveModel(name);
//    deferred.then(function() {
//      el.fillEntityIdSelect(name);
//    });
//  } else {
//    el.fillEntityIdSelect(name);
//  }
  
  /**
   * Requires: 
   * 
   * an element with id="modal-holder"
   * 
   */
  insertModalHtml: function() {
    var htmlString = "" + 
    "<div id='modal' class='modal fade'>" +
    "  <div class='modal-dialog'>" +
    "    <div class='modal-content'>" +
    "      <div id='modal-header' class='modal-header'></div>" +
    "      <div id='modal-body' class='modal-body'>" +
    "        <div id='error-message-div' class='hide'> " +
    "          <div class='alert alert-danger' role='alert'> " +
    "            <span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span> " +
    "            <span id='error-message'></span><br /> " +
    "            <span id='error-message-status'></span>: " +
    "            <span id='error-message-status-text'></span> " +
    "          </div> " +
    "        </div>" +
    "        <div id='form-target'></div>" +
    "      </div>" +
    "      <div id='modal-footer' class='modal-footer'></div>" +
    "    </div><!-- /.modal-content -->" +
    "  </div><!-- /.modal-dialog -->" +
    "</div><!-- /.modal -->";
    
    $("#modal-holder").html(htmlString);
  },
  
  /**
   *  Returns a random integer between min (inclusive) and max (inclusive) 
   *  Using Math.round() will give you a non-uniform distribution! 
   */ 
  getRandomInt: function(min, max) { 
    return Math.floor(Math.random() * (max - min + 1)) + min; 
  },
  
  chosenOptions: {
    search_contains: true
  },
  
  hideOptions: {
    duration: 250
  },
  
  showOptions: {
    duration: 250
  },
  
  toggleOptions: {
    duration: 250  
  },
    
};
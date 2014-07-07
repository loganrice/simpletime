$("#login").show();
$("#app").hide();
var OOP = [];
var records;
// Authenticate with Dropbox
var client = new Dropbox.Client({key: "alq5h2q2wwbqyga"});
client.authenticate({interactive: false}, function (error) {
    if (error) {
        alert('Authentication error: ' + error);
    }
});

if (client.isAuthenticated()) {
    $("#login").hide();
    $("#app").show();
}

// Bind authenticate method to login button and listen for click on button
$("#login").on("click", client.authenticate());
  
var datastoreManager = client.getDatastoreManager();
datastoreManager.openDefaultDatastore(function (error, datastore) {
    if (error) {
        alert('Error opening default datastore: ' + error);
    }

    // Let the user read all tasks by printing them to the screen
    var taskTable = datastore.getTable('tasks');
    var results = taskTable.query({completed: false});

    // Record object
    function Record(tableRecord) {
      this.Id = tableRecord.getId();
      this.taskname = tableRecord.get("taskname");
      this.seconds = tableRecord.get("seconds");
      // finds itself in records array, useful for addlistener
      this.arrayIndex = function() {
        for( var i = 0; i < records.length; i++){
          if (records[i].Id == this.Id) {
            return i;
          } else {
            return false;
          }
        }
      }
      this.update = function(field, value) {
        tableRecord.set('seconds', value);
      };
    }
    records = [] // list of Record instances

    $("#todos").on("click", ".stop", function(event){
      var time = $(this).siblings(".timer").text();
      var id = $(this).parent().attr("id");
      var found = false;
      for( var i = 0; i < records.length; i++){
        if (records[i].Id == id) {
          found = true;
          records[i].update('seconds', time);
          break;
        }
      }
    })

    // itererate through results and add each record to array
    // and update DOM
    for (var k=0; k<results.length;k++ ) {
        var rec = new Record(results[k]);
        records.push(rec);
        displayRecord(rec.Id, rec.taskname, rec.seconds);
    }

    // print records to DOM
    function displayRecord(id, name, time) {
        var listElem = document.createElement('li');
        $(listElem).attr("id", id);
        $(listElem).addClass("list-group-item");
        $(listElem).text(name);
        new Stopwatch(listElem);
        $(listElem).children(".timer").text(time);
        $("#todos").append(listElem);
    }

    // Let users add tasks
    $("#add").on("click", function() {
        taskTable.insert({
            taskname: $("#newTask").val(),
            completed: false,
            created: new Date(),
            seconds: 0
        });
    });

    $("#todos").on("dblclick", ".list-group-item", function () {
      var recordId = $(this).attr("id");
      $(this).remove();
      deleteRecord(taskTable, recordId);
    })

    
    // As new tasks are added automatically update the task list
    datastore.recordsChanged.addListener(function (event) {
        var items = event.affectedRecordsForTable('tasks');
        for (var k=0; k<items.length;k++ ) {
          // if the item does not exist
          // add the new item to DOM else
          // update the time 
          var item = new Record(items[k])
          var timerElem = $("#"+item.Id + " .timer");
          console.log(item.arrayIndex());
          if (item.arrayIndex() == false ) {
            displayRecord(item.Id, item.taskname);
          } else {
            timerElem.text(item.seconds);
          }
        }
        addButtonGlyphs();
    });

addButtonGlyphs();
});


var deleteRecord = function (table, recordId) {
  var record = table.getOrInsert(recordId);
  record.deleteRecord();
}

// adds special classes for bootstrap glyphs
var addButtonGlyphs = function () {
  $(".reset .badge span").addClass("glyphicon glyphicon-remove");
  $(".stop .badge span").addClass("glyphicon glyphicon-stop");
  $(".start .badge span").addClass("glyphicon glyphicon-time");
}

// object to used create stop watch elements
var Stopwatch = function(elem, options) {
  var timer = createTimer(),
  resetButton = createButton("reset", reset),
  stopButton = createButton("stop", stop),
  startButton = createButton("start", start),
  offset,
  clock,
  interval;

  // default options
  options = options || {};
  options.delay = options.delay || 1;

  // append elements
  elem.appendChild(timer);
  elem.appendChild(resetButton);
  elem.appendChild(stopButton);
  elem.appendChild(startButton);

  // initialize
  reset();

  // private functions
  function createTimer() {
    var timerElement = document.createElement("span");
    $(timerElement).addClass("timer");
    return timerElement;
  }

  function createButton(action, handler) {
    var a = document.createElement("a");
    a.href = "#";
    $(a).addClass(action);

    $(a).append("<span class='badge'><span>" + "<em>" + action + "</em></span></span>");
    a.addEventListener("click", function(event) {
      handler();
      // event.preventDefault();
    });
    return a;
  }

  function start() {
    if (!interval) {
      offset = Date.now(); 
      interval = setInterval(update, options.delay);
    }
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function reset() {
    clock = 0;
    render(0);
  }

  function update() {
    clock += delta();
    render();
  }

  function render() {
    timer.innerHTML = clock/1000;
  }

  function delta() {
    var now = Date.now(),
          d = now - offset;
     offset = now;
     return d;
  }

  // public API
  this.reset = reset;
  this.stop  = stop;
  this.start = start;
};
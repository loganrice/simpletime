$("#login").show();
$("#app").hide();
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

// Bind authenticate method to your login button and listen for click on button
$("#login").on("click", client.authenticate());


var datastoreManager = client.getDatastoreManager();
datastoreManager.openDefaultDatastore(function (error, datastore) {
    if (error) {
        alert('Error opening default datastore: ' + error);
    }

    // Let the user read all tasks by printing them to the screen
    var taskTable = datastore.getTable('tasks');
    var results = taskTable.query({completed: false});

    for (var k=0; k<results.length;k++ ) {
        var id = results[k].getId();
        var taskname = results[k].get("taskname");
        var listElem = "<li id='" + id +"'>" + taskname + "</li>"
        var todoElem = $("#todos").append(listElem);
        // var todoElem = $("#todos").append( "<li>"+results[k].get("taskname") + "</li>");
    }

    $("li").addClass("list-group-item");


    // Let users add tasks
    $("#add").on("click", function() {
        taskTable.insert({
            taskname: $("#newTask").val(),
            completed: false,
            created: new Date()
        });

    });

    // submit stopwatch time
    $(".list-group-item").on("click", ".stop", function() {
      time = $(this).prev().prev().text();
      // var timequery = taskTable.query({title: false});
    });
    

    // As new tasks are added automatically update the task list
    datastore.recordsChanged.addListener(function (event) {
        var records = event.affectedRecordsForTable('tasks');
        for (var k=0; k<records.length;k++ ) {
            $("#todos").append( "<li>"+records[k].get("taskname") + "</li>");
        }
        $("li").addClass("list-group-item");    
    });


var listAppendStopWatch = function () {
  var elems = document.getElementsByClassName("list-group-item");

  for (var i=0, len=elems.length; i<len; i++) {
    new Stopwatch(elems[i]);
  }
}

var addButtonGlyphs = function () {
  $(".reset .badge span").addClass("glyphicon glyphicon-remove");
  $(".stop .badge span").addClass("glyphicon glyphicon-stop");
  $(".start .badge span").addClass("glyphicon glyphicon-time");
}

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
    // a.innerHTML = action;
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

listAppendStopWatch();
addButtonGlyphs();
});


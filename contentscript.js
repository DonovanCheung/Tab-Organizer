/*
"_" = Extension version (i.e. the variables "tab" and "window" is associated
with the literal tab and window in the chrome browser, the variable "_tab"
and "_window" are used as placeholders for said tab and window in the
extension)

IDEAS
If a _window is empty, should I still create an empty window
Should users be able to drag _tabs between _windows
Double click to edit the url
Use arrow keys to navigate _tabs between _windows and the tabSection
Should I have the first _window popup last
Should it add tabs chronologically based on the order of the users' clicks
Should it have a custom reset button to make it more responsive (Gets rid of
blinking issue, has a nice animation, and allows the user to keep the _windows
they have opened)
Clarify the difference between _tab and _tabs
Give better names to _selectInTabs and _selectInWins
Give it the ability to save webpages for later
Make it available to Firefoz too
*/

$(document).ready(function(){
  var _windowCount = 1;
  var _windowID = 1;
  var targetWindow = null; // CHECK
  var tabIDList = [];

  var _winCutoffTop = -218/2;
  var _winCutoffBot = 218/2;

  var n = 0;
  var _IDList = ["1"];
  var _currentWin = $(".window#"+ _IDList[n]);

  $("ol").sortable();
  var lastScrollTop = 0; // CHECK

  function setup(tab){
    chrome.windows.getCurrent(getWindows);
  }

  function getWindows(win){
    targetWindow = win;
    chrome.tabs.getAllInWindow(targetWindow.id, getTabs);
  }

  function getTabs(tabs){
    // We require all the tab information to be populated.
    chrome.windows.getAll({"populate" : true}, listTabs);
  }

  function listTabs(windows){
    var numWindows = windows.length;
    for (var i = 0; i < numWindows; i++){
      var win = windows[i];
      var numTabs = win.tabs.length;
      for (var j = 0; j < numTabs; j++){
        var tab = win.tabs[j];
        var iconUrl = tab.favIconUrl;
        if (!iconUrl){
          iconUrl = "blank-page-icon.png";
        }
        $("#tabSection ol").append("<li class = 'tab' id = " + tab.id + ">" +
        "<img src = " + iconUrl + " width = '15px'/>  " + tab.title + "</li>");
        tabIDList.push(tab.id);
      }
    }
    start();
  }

  function start(){
    $(document).on("click", "#executeButton", function(){
      $(".window").each(function(){
        var _tabs = $(this).children("ol").children(".tab"); // Change .tabList to ol
        chrome.windows.create(function(newWindow){
          _tabs.each(function(){
            for (var i = 0; i < tabIDList.length; i++){
              if (tabIDList[i] == $(this).attr("id")){
                chrome.tabs.move(Number($(this).attr("id")),
                  {"windowId": newWindow.id, "index": -1});
              }
            }
          });
          chrome.tabs.remove(newWindow.tabs[0].id);
        });
      });
    });

    $(document).on("click", ".tab", function(){
      var _tab = $(this);
      var _tabHolder = $(this).parent().parent().attr("id");
      if (_tabHolder == "tabList"){
        _tab.toggleClass("_selectInTabs");
      }
      else{
        _tab.toggleClass("_selectInWins");
      }
    });

    $("#addWindow").click(function(){
      _windowCount++;
      _windowID++;
      var _winID = _windowID.toString();
      _IDList.push(_winID);
      $(this).before("<div class = 'window' id = " + _winID +
      "><div class='closeWindow'><b></b><b></b><b></b><b></b></div>" +
      "<ol id = " + _winID + "></ol>");
      console.log(_IDList);
    });

    $(document).on("click", ".closeWindow", function(){
      if (_windowCount > 1){
        var _deadWin = $(this).parent();
        var _deadWinID = _deadWin.attr("id");
        var _tabs = _deadWin.children("ol").html();
        var index = _IDList.indexOf(_deadWinID);
        _IDList.splice(index, 1);
        $("#tabSection ol").append(_tabs);
        $("#" + _deadWinID).remove();
        $("#" + _deadWinID).remove();
        _windowCount--;
      }
    });

    $(document).on("click", "#addTabs", function(){
      var _selectInTabs = $("._selectInTabs");
      _currentWin.find("ol").append(_selectInTabs);
      _selectInTabs.removeClass("_selectInTabs");
      $("ol").sortable();
    });

    $(document).on("click", "#returnTabs", function(){
      var _selectInWins = $("._selectInWins");
      $("#tabList ol").append(_selectInWins);
      _selectInWins.removeClass("_selectInWins");
    });

    $(document).on("click", "#resetButton", function(){
      location.reload();
    });

    $("#windowSection").on("scroll", function(){
        _currentWin = $(".window#"+ _IDList[n]);
        var _currentWinTop = _currentWin.position().top;
        if (_currentWinTop < _winCutoffTop){
          n++;
          _currentWin = $(".window#"+_IDList[n]);
          _currentWinTop = _currentWin.position().top;
        }
        else if (_currentWinTop > _winCutoffBot){
          n--;
          _currentWin = $(".window#"+_IDList[n]);
          _currentWinTop = _currentWin.position().top;
        }
        /*console.log(_currentWin);
        console.log(_currentWinTop);*/
    });

    /*$(".button").hover(function(){
      var thisButton = $(this);
      var thisButtonID = $(this).attr("id");
      if (thisButtonID == "addTabs"){
        thisButton.css("border-bottom", "4px solid rgb(200, 200, 225)");
      }

    }, function(){

    });*/

  }

  setup();
});

//= require sanitize
//= require kanbanlist
//= require auto_loading_timer
//= require ajax_loader
//= require background_image
//= require utility
//= require touch_event
//= require book_navi
//= require send_mail
//= require today_marker
//= require draggable_task
//= require task_action
//= require filter_navi
//= require todo
//= require pomo_timer

// dependent modules 
var autoLoadingTimer = KanbanList.autoLoadingTimer;
var utility = KanbanList.utility;
var ajaxLoader = KanbanList.ajaxLoader;
var touchEvent = KanbanList.touchEvent;
var backgroundImage = KanbanList.backgroundImage;
var bookNavi = KanbanList.bookNavi;
var sendMail = KanbanList.sendMail;
var todayMarker = KanbanList.todayMarker;
var draggableTask = KanbanList.draggableTask;
var filterNavi = KanbanList.filterNavi;
var pomodoroTimer = KanbanList.pomodoroTimer;

$(document).ready(function(){ 
  // initialize menus
  bookNavi.init();
  sendMail.init();
  autoLoadingTimer.init();
  backgroundImage.init();
  filterNavi.init({submit: filterTask});
  pomodoroTimer.init();

  // initialize modules
  draggableTask.setHandlers({receive: sendCurrentTodo});

  $('a[rel=tooltip]').tooltip({ placement:"bottom"});
  return;
});

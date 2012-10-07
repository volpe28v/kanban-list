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

$(document).ready(function(){ 
  // initialize menus
  bookNavi.init();
  sendMail.init();
  autoLoadingTimer.init();
  backgroundImage.init();
  filterNavi.init({submit: filterTask});

  // initialize modules
  draggableTask.setHandlers({receive: sendCurrentTodo});

  $('a[rel=tooltip]').tooltip({ placement:"bottom"});
  return;
});

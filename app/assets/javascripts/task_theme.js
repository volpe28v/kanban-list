// TaskTheme 
KanbanList.namespace('taskTheme');

var COOKIE_EXPIRES = 365;
var COOKIE_TASK_THEME = 'kanbanlist_task_theme';
KanbanList.taskTheme = (function(){

  function setTheme(theme_name){
    $('#task_theme').attr('href', "/assets/task_" + theme_name + ".css");
    $.cookie(COOKIE_TASK_THEME,theme_name ,{ expires: COOKIE_EXPIRES });
  }

  function init(){
    var theme_name = $.cookie(COOKIE_TASK_THEME) ? $.cookie(COOKIE_TASK_THEME) : "default";
    setTheme(theme_name);
  }

  return {
    setTheme: setTheme,
    init: init
  }
}());
 

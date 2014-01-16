// AutoLoadingTimer
KanbanList.namespace('autoLoadingTimer');

KanbanList.autoLoadingTimer = (function(){
  //private
  var valid = false;
  var stack = 0;
  var timer_id = null;

  function loadLatestTasks(filter_str){
    if ($('#add_todo_form_msg').val() != ""){ return; };

    $.ajax({
       type: "POST",
       cache: false,
       url: "tasks/silent_update",
       data: {
         filter: filter_str
       },
       dataType: "jsonp"
    });
  }

  // public
  function init(){
    $('#auto_loading').html("Turn ON");
    var setAutoLoading = function(){
      if ( isActive() ){
        stop();
        setMode(false);
        $('#auto_loading').html("Turn ON");
      }else{
        setMode(true);
        start();
        $('#auto_loading').html("Turn OFF");
      }
    }

    $('#auto_loading').click(function(){
      setAutoLoading();
    });
  }

  function setMode(mode){
    valid = mode;
  }

  function isValid(){
    return valid == true;
  }

  function start(){
    if ( !isValid() ){ return; }
    stack++;
    if ( stack != 1 ){ return; }
    timer_id = setInterval( function() { loadLatestTasks( $('#filter_str').get(0).value ); },5000 );
  }

  function startForce(){
    if ( !isValid() ){ return; }
    stack = 1;
    clearInterval(timer_id);
    timer_id = setInterval( function() { loadLatestTasks( $('#filter_str').get(0).value ); },5000 );
  }

  function stop(){
    if ( !isValid() ){ return; }
    stack--;
    if ( stack != 0 ){ return; }
    clearInterval(timer_id);
  }

  function isActive(){
      return stack >= 1 ;
  }

  return {
    //public
    init: init,
    setMode: setMode,
    isValid: isValid,
    start: start,
    startForce: startForce,
    stop: stop,
    isActive: isActive
  }
}());

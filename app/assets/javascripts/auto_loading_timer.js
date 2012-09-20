// AutoLoadingTimer
KanbanList.namespace('autoLoadingTimer');

KanbanList.autoLoadingTimer = (function(){
  //private
  var valid = false;
  var stack = 0;
  var timer_id = null;

  function loadLatestTasks(filter_str){
    if ($('#add_todo_form_msg').val() != ""){ return; };

    var request_str = "filter=" + filter_str;

    $.ajax({
       type: "POST",
       cache: false,
       url: "tasks/silent_update",
       data: request_str,
       dataType: "jsonp"
    });
  }

  return {
    //public
    setMode: function(mode){
      valid = mode;
    },
    isValid: function(){
      return valid == true;
    },
    start: function(){
      if ( !this.isValid() ){ return; }
      stack++;
//      console.log(stack);
      if ( stack != 1 ){ return; }
      timer_id = setInterval( function() { loadLatestTasks( $('#filter_str').get(0).value ); },5000 );
    },
    startForce: function(){
      if ( !this.isValid() ){ return; }
      stack = 1;
//      console.log(stack);
      clearInterval(timer_id);
      timer_id = setInterval( function() { loadLatestTasks( $('#filter_str').get(0).value ); },5000 );
    },
    stop: function(){
      if ( !this.isValid() ){ return; }
      stack--;
//      console.log(stack);
      if ( stack != 0 ){ return; }
      clearInterval(timer_id);
    },
    isActive: function(){
      return stack >= 1 ;
    }
  }
}());



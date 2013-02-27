KanbanList.namespace('filterNavi');
KanbanList.filterNavi = (function(){
  var autoLoadingTimer = KanbanList.autoLoadingTimer;

  function init(callbacks){
    $('#filter_form').submit(function(){
      if (callbacks.submit != undefined){
        callbacks.submit($('#filter_str').val());
      }
      $('#filter_str').blur();
      return false;
    });

    $('#filter_str').focus(function(){
      autoLoadingTimer.stop();
    });

    $('#filter_str').blur(function(){
      autoLoadingTimer.start();
    });
  }

  return {
    init: init
  }

}());

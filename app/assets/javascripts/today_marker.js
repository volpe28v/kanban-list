KanbanList.namespace('todayMarker');
KanbanList.todayMarker = (function(){
  // 本日の編集した要素にマーカーをつける
  function markAll(){
    markWithElem( $('ul li span[id*="_time_"]:contains(' + utility.getTodayStr() + ')') );
  }

  function markById( id ){
    markWithElem( $("#edit_link_time_" + id ) );
    markWithElem( $("#fixed_time_" + id ) );
  }

  function markWithElem( mark_obj ){
    mark_obj.removeClass("label-info");
    mark_obj.addClass("label-important");
  }

  return {
    // public
    markAll: markAll,
    markById: markById
  }
}());

// BookNavi
KanbanList.namespace('bookNavi');

KanbanList.bookNavi = (function(){

  function initBookListName(){
    $.ajax({
       type: "GET",
       cache: false,
       url: "/books/get_book_lists",
       dataType: "jsonp"
    });
  }

  function initNewBookAction(){
    $('#new_book').click(function(){
      $('#book_in').modal('show');
      setTimeout(function(){
        $('#book_name').val('');      
        $('#book_name').focus();
      },500);
    });
  }

  function initRemoveBookAction(){
    $('#remove_book').click(function(){
      $('#remove_book_in').modal('show');
    });
  }

  function setAction(){
    initNewBookAction();
    initRemoveBookAction();
  }

  function init(){
    initBookListName();

    var new_book_action = function(){
      var name = $('#book_name').val();
      if ( name != "" ){
        newBook(name);
        $('#book_in').modal('hide')
      }
    };

    $('#book_form').submit(function(){
      new_book_action();
      return false;
    });

    $('#new_book_button').click(function(){
      new_book_action();
    });

    $('#remove_book_button').click(function(){
      autoLoadingTimer.stop();
      $('#remove_book_in').modal('hide');

      ajaxLoader.start();

      var dummy_id = 0
      var request_str = "filter=" + $('#filter_str').get(0).value;
      $.ajax({
        type: "DELETE",
        cache: false,
        url: "books/" + dummy_id,
        data: request_str,
        dataType: "jsonp"
      });
    });

    $('#remove_book_cancel_button').click(function(){
      $('#remove_book_in').modal('hide');
    });
  }

  return {
    init: init
  }
}());




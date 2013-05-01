// BookNavi
KanbanList.namespace('bookNavi');

KanbanList.bookNavi = (function(){
  var autoLoadingTimer = KanbanList.autoLoadingTimer;
  var ajaxLoader = KanbanList.ajaxLoader;

  // private
  function newBookAction(book_name){
    autoLoadingTimer.stop();
    var filter = $('#filter_str').get(0).value;

    ajaxLoader.start(function(){
      $.ajax({
        type: "POST",
        cache: false,
        url: "books",
        data: {
          filter: filter,
          book_name: book_name
        },
        dataType: "jsonp"
      });
    });
  }

  function selectBookAction(book_id){
    autoLoadingTimer.stop();
    var filter = $('#filter_str').get(0).value;

    ajaxLoader.start(function(){
      $.ajax({
        type: "GET",
        cache: false,
        url: "books/" + book_id,
        data: {
          filter: filter
        },
        dataType: "jsonp"
      });
    });
  }

  function setAction(book_infos){
    initNewBookAction();
    initRemoveBookAction();

    for(var i = 0; i < book_infos.length; i++ ){
      $('#book_list_' + book_infos[i].id + ' a').click(function(){
        var book_id = book_infos[i].id;
        return function(){
          selectBookAction( book_id );
        }
      }());
    }
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

  function init(){
    var new_book_action = function(){
      var name = $('#book_name').val();
      if ( name != "" ){
        newBookAction(name);
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

      var dummy_id = 0
      var filter = $('#filter_str').get(0).value;
      ajaxLoader.start(function(){
        $.ajax({
          type: "DELETE",
          cache: false,
          url: "books/" + dummy_id,
          data: {
            filter: filter
          },
          dataType: "jsonp"
        });
      });
    });

    $('#remove_book_cancel_button').click(function(){
      $('#remove_book_in').modal('hide');
    });
  }

  function updateByJson( book_infos ){
    if ( book_infos == null ){ return; }
    var header = '<li><a id="new_book" href="#"><i class="icon-plus"></i> New Book</a></li>' +
               '<li><a id="remove_book" href="#"><i class="icon-trash"></i> Remove Current Book</a></li>' +
               '<li class="divider"></li>';

    var lists = '';
    for(var i = 0; i < book_infos.length; i++ ){
      var active_todo_counts = book_infos[i].todo_h + book_infos[i].todo_m + book_infos[i].todo_l + book_infos[i].doing + book_infos[i].waiting;
      lists += '<li id="book_list_' + book_infos[i].id + '">' +
                 '<a href="#">' + book_infos[i].name +
                   '<table style="float:right" class="book-counts">' +
                     '<tr>' +
                       '<td><div class="counts-active" >' + active_todo_counts   + '</div></td>' +
                       '<td><div class="counts todo_h ' + (book_infos[i].todo_h == 0 ? 'zero' : '') + '" >' + book_infos[i].todo_h + '</div></td>' +
                       '<td><div class="counts todo ' + (book_infos[i].todo_m == 0 ? 'zero' : '') + '"   >' + book_infos[i].todo_m + '</div></td>' +
                       '<td><div class="counts todo_l ' + (book_infos[i].todo_l == 0 ? 'zero' : '') + '" >' + book_infos[i].todo_l + '</div></td>' +
                       '<td><div class="counts doing ' + (book_infos[i].doing == 0 ? 'zero' : '') + '"  >' + book_infos[i].doing  + '</div></td>' +
                       '<td><div class="counts waiting ' + (book_infos[i].waiting == 0 ? 'zero' : '') + '">' + book_infos[i].waiting + '</div></td>' +
                       '<td><div class="counts done ' + (book_infos[i].done == 0 ? 'zero' : '') + '"   >' + book_infos[i].done    + '</div></td>' +
                     '</tr>' +
                   '</table>' +
                 '</a>' +
               '</li>';
    }

    $('#book_list').empty();
    $('#book_list').append(header + lists);

    setAction(book_infos);
  }

  return {
    // public
    init: init,
    updateByJson: updateByJson
  }
}());

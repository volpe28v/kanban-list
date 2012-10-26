//= require sanitize
KanbanList.namespace('taskAction');
KanbanList.taskAction = (function(){
  function display_filter(text){
    var sanitize_text = sanitize(text);
    var linked_text = sanitize_text.replace(/((https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+))/g,
      function(){
        var matched_link = arguments[1];
        if ( matched_link.match(/(\.jpg|\.gif|\.png|\.bmp)$/)){
          return '<img src="' + matched_link + '"/>';
        }else{
          return '<a href="' + matched_link + '" target="_blank" >[URL]</a>';
        }
      });

    var prefixed_text = linked_text.replace(/^(\[.+?\])/,
      function(){
        var matched_prefix = arguments[1];
        return '<span class="book-name">' + matched_prefix + '</span>';
      });
    prefixed_text = prefixed_text.replace(/^【(.+?)】/,
      function(){
        var matched_prefix = arguments[1];
        return '<span class="book-name">[' + matched_prefix + ']</span> ';
      });
    return prefixed_text;
  }

  function updateToDoMsg(from, to) {
    var msg = sanitize($(from).val());
    $(from).val(msg);
    $(to).html(display_filter(msg));

    var id = to.slice(5);
    sendCurrentTodo(id, "", msg);
  }
 
  function deleteTodo( delete_id ) {
    var msg_id = '#msg_' + delete_id.slice(4);
    var id = delete_id.slice(4);
    $.ajax({
      type: "DELETE",
      cache: false,
      url: "tasks/" + id,
      dataType: "jsonp"
    });

    setTimeout(function(){
      $(delete_id).fadeOut(function(){
        $(delete_id).remove();
      });
    },500);
  }

  function moveTo(status, move_id){
    var to_status = status;
    var id = move_id.slice(4);
    var msg = $("#msg_" + id).html();
    var target_status = $("#" + to_status);
    var updated_date = $("#updated_" + id).html();

    if (target_status.hasClass("ui-li")){
      setTimeout(function(){
        $(move_id).fadeOut("normal",function(){ $(move_id).insertAfter($("#" + to_status)); });
        $(move_id).fadeIn("normal");
      },500);
    }else{
      var move_item = 
        '<li id="id_' + id + '">' + 
          '<a href="#setting_' + id + '">' + 
            '<span class="label label-info" id="updated_' + id + '" style="display:inline;">' + updated_date + '</span> <span id="msg_' + id + '">' + msg + '</span>' + 
          '</a>' +
        '</li>';

      setTimeout(function(){
        $(move_id).fadeOut(function(){
          $(move_id).remove();
          $("#" + to_status).after(move_item);
        });
      },500);
    }

    sendCurrentTodo(id, to_status, msg);
  }

  function initial_task(id, msg_array){
    var msg = msg_array.join('\n');

    $('#msg_' + id ).html(display_filter(msg));
  }

  function realize_task(id, msg_array){
    var msg = msg_array.join('\n');

    $('#edit_msg_' + id).val(msg);

//TODO: 後で有効にする
//    $('#edit_msg_' + id).maxlength({
//      'feedback' : '.task-chars-left'
//    });

    $('#update_btn_' + id).click(function(){
      updateToDoMsg('#edit_msg_' + id, '#msg_' + id);
    });

    $('#delete_btn_' + id).click(function(){
      deleteTodo('#msg_' + id);
    });

    $('#todo_h_btn_' + id).click(function(){
      moveTo('todo_h','#id_' + id);
    });

    $('#todo_m_btn_' + id).click(function(){
      moveTo('todo_m','#id_' + id);
    });

    $('#todo_l_btn_' + id).click(function(){
      moveTo('todo_l','#id_' + id);
    });

    $('#doing_btn_' + id).click(function(){
      moveTo('doing','#id_' + id);
    });

    $('#waiting_btn_' + id).click(function(){
      moveTo('waiting','#id_' + id);
    });

    $('#done_btn_' + id).click(function(){
      moveTo('done','#id_' + id);
    });

    $('#delete_btn_' + id ).click(function(){
      deleteTodo('#id_' + id );
    });
  }

  return {
    initial_task: initial_task,
    realize: realize_task,
    display_filter: display_filter
  }
}());



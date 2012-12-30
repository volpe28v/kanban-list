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
    prefixed_text = prefixed_text.replace(/\n/g,'<br>');
    return '<span class="msg-body">' + prefixed_text + '</span>';
  }

  function updateToDoMsg(id, status) {
    var msg = sanitize($('#edit_msg')).val();
    $('#msg_' + id).html(display_filter(msg));

    org_msg[id].msg = msg;
    if ( status != "" ){ org_msg[id].status = status; }

    sendCurrentTodo(id, status, msg);
  }
 
  function deleteTodo( id ) {
    var msg_id = '#msg_' + id;
    var delete_id = '#id_' + id
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

  function moveTo(status, id){
    var move_id = '#id_' + id;
    var target_status = $("#" + status);

    updateToDoMsg(id, status);

    if (target_status.hasClass("ui-li")){
      setTimeout(function(){
        $(move_id).fadeOut("normal",function(){ $(move_id).insertAfter($("#" + status)); });
        $(move_id).fadeIn("normal");
      },500);
    }else{
      var display_msg = $("#msg_" + id).html();
      var updated_date = $("#updated_" + id).html();
      var move_item = 
        '<li id="id_' + id + '">' + 
          '<a href="#setting_' + id + '">' + 
            '<table><tr>' + 
              '<td><span class="label label-important" id="updated_' + id + '" style="display:inline;">' + updated_date + '</span></td>' + 
              '<td><span id="msg_' + id + '">' + display_msg + '</span></td>' + 
            '</tr></table>' + 
          '</a>' +
        '</li>';

      setTimeout(function(){
        $(move_id).fadeOut(function(){
          $(move_id).remove();
          $("#" + status).after(move_item);
        });
      },500);
    }
  }

  var org_msg = {}; //編集前 msg 退避用ハッシュ
  function initial(id, status, msg_array){
    var msg = msg_array.join('\n');
    org_msg[id] = { msg: msg, status: status };
    $('#msg_' + id ).html(display_filter(msg));
  }

  function initial_setting(){
    $('#edit_msg').maxlength({
      'feedback' : '.task-chars-left'
    });

    $('#update_btn').click(function(){
      var id = $('#setting').data('id');
      updateToDoMsg(id, "");
    });

    $('#delete_btn').click(function(){
      var id = $('#setting').data('id');
      deleteTodo(id);
    });

    $('#todo_h_btn').click(function(){
      var id = $('#setting').data('id');
      moveTo('todo_h',id);
      history.back();
    });

    $('#todo_m_btn').click(function(){
      var id = $('#setting').data('id');
      moveTo('todo_m',id);
      history.back();
    });

    $('#todo_l_btn').click(function(){
      var id = $('#setting').data('id');
      moveTo('todo_l',id);
      history.back();
    });

    $('#doing_btn').click(function(){
      var id = $('#setting').data('id');
      moveTo('doing',id);
      history.back();
    });

    $('#waiting_btn').click(function(){
      var id = $('#setting').data('id');
      moveTo('waiting',id);
      history.back();
    });

    $('#done_btn').click(function(){
      var id = $('#setting').data('id');
      moveTo('done',id);
      history.back();
    });
  }

  // タスクリストをクリックしたタイミングで呼ばれる
  // pagebeforechange イベントで使う
  function get_setting_page(url){
    var id = url.replace(/.*id=/,"");

    var $page = $('#setting');
    $page.data('id',id);
    $page.find('#edit_msg').val(org_msg[id].msg);

    // 状態遷移ボタンに色付けする
    $page.find('.status-btn').buttonMarkup({ theme: 'b' });
    $page.find('#' + org_msg[id].status + '_btn').buttonMarkup({ theme: 'e' });

    return $page;
  }

  return {
    initial: initial,
    initial_setting: initial_setting,
    get_setting_page: get_setting_page,
    display_filter: display_filter
  }
}());



/*
 * todo.js
 * created by Naoki Kodama
 */
var COOKIE_EXPIRES = 365;
var COOKIE_MAIL_ADDR = 'kanbanlist_mail_addr';
var COOKIE_BG_IMAGE = 'kanbanlist_bg_image_url';
var last_task_list_html = "";

$(document).ready(function(){ 
  initBookList();
  initNavBooks();
  initSendMail();
  initAutoLoading();
  initSetBgImage();

  $('a[rel=tooltip]').tooltip({ placement:"bottom"});
  return;
});

var autoLoadingTimer = function(){
  var valid = false;
  var stack = 0;
  var timer_id = null;

  return {
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
  };
}();

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


function initNavBooks(){
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

    loadingTasklist();

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

function initSendMail(){
  var addr = $.cookie(COOKIE_MAIL_ADDR);
  if ( addr ){
    $('#mail_addr').val(addr);
  }

  $('#send_mail').click(function(){
    $('#mail_in').modal('show');
    setTimeout(function(){
      $('#mail_addr').focus();
    },500);
  });

  var send_mail_action = function(){
    var addr = $('#mail_addr').val();
    if ( addr != "" ){
      $('#sending_mail').html('<strong>Processing...</strong> sending email to ' + addr);
      $('#sending_mail').fadeIn();
      sendMail(addr);
      $('#mail_in').modal('hide')
      $.cookie(COOKIE_MAIL_ADDR,addr,{ expires: COOKIE_EXPIRES });
    }
  };

  $('#mail_form').submit(function(){
    send_mail_action();
    return false;
  });

  $('#send_mail_button').click(function(){
    send_mail_action();
  });
}

function sendMail(addr){
  var request_str = "mail_addr=" + addr;

  $.ajax({
     type: "POST",
     cache: false,
     url: "tasks/send_mail",
     data: request_str,
     dataType: "jsonp"
  });
}

function initAutoLoading(){
  $('#auto_loading').html("To ON");
  var setAutoLoading = function(){
    if ( autoLoadingTimer.isActive() ){
      autoLoadingTimer.stop();
      autoLoadingTimer.setMode(false);
      $('#auto_loading').html("To ON");
    }else{
      autoLoadingTimer.setMode(true);
      autoLoadingTimer.start();
      $('#auto_loading').html("To OFF");
    }
  }

  $('#auto_loading').click(function(){
    setAutoLoading();
  });
}

function initSetBgImage(){
  var image_url = $.cookie(COOKIE_BG_IMAGE);
  $('#image_url').val(image_url);
  setBgImage(image_url);

  $('#set_bg_image').click(function(){
    $('#bg_image_in').modal('show');
    setTimeout(function(){
      $('#image_url').focus();
    },500);
  });

  var set_bg_image_action = function(){
    var image_url = $('#image_url').val();
    setBgImage(image_url);
    $('#bg_image_in').modal('hide')
    $.cookie(COOKIE_BG_IMAGE,image_url,{ expires: COOKIE_EXPIRES });
  };

  $('#bg_image_form').submit(function(){
    set_bg_image_action();
    return false;
  });

  $('#set_bg_image_button').click(function(){
    set_bg_image_action();
  });
}

function setBgImage(image_url){
  $("#body_core").css('background-image','url(' + image_url + ')');
}

function touchHandler(event){
  if (event.touches.length > 1){return;} //マルチタッチを無効化

  var touches = event.changedTouches;
  event.preventDefault();
  var first = touches[0];
  var type = "";
  switch(event.type)
  {
    case "touchstart":
      type = "mousedown";
      break;
    case "touchend":
      type = "mouseup";
      break;
    case "touchmove":
      type = "mousemove";
      break;
    default:
      return;
  }
  dispatchMouseEvent(type, first);
}

function dispatchMouseEvent( event_type, touch_event ){
  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(
    event_type, true, true, window, 1,
    touch_event.screenX,
    touch_event.screenY,
    touch_event.clientX,
    touch_event.clientY,
    false, false, false, false, 0, null);

  touch_event.target.dispatchEvent(simulatedEvent);
}

function touch_init()
{
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("msie") > -1) {
    return;
  }

  var label_elemens = document.getElementsByClassName("taskLabel");
  var i = 0;
  for(i=0;i < label_elemens.length;i++){
    addMouseEventListener(label_elemens[i]);
  }
}

function addMouseEventListener(element){
  element.addEventListener("touchstart",  touchHandler, true);
  element.addEventListener("touchmove",   touchHandler, true);
  element.addEventListener("touchend",    touchHandler, true);
  element.addEventListener("touchcancel", touchHandler, true);
}

function initForTaskList(){
  $("#add_todo_form input:submit").button();
  setSortableList();
  markTodayEdit();
}

var option = {
  start  : function(event, ui){
      autoLoadingTimer.stop();
      var update_id = ui.item.attr("id").slice(3);
      },
  stop   : function(event, ui){
      autoLoadingTimer.start();
      var update_id = ui.item.attr("id").slice(3);
      },

  receive: function(event, ui){
      var update_id = ui.item.attr("id").slice(3);

      sendCurrentTodo( update_id,
                       $(this).get(0).id,
                       $("#ms_" + update_id + "_edit").val());
      },

  connectWith: 'ul',
  placeholder: 'ui-state-highlight',
  cancel: "#cancel",
  scroll: true,
  tolerance: 'pointer',
  revert: true
};

// ドラッグ＆ドロップ可能にする
function setSortableList(){
  $("#doing, #waiting, #todo_m, #todo_l, #todo_h" ).sortable(option).enableSelection();
}

function initBookList(){
  $.ajax({
     type: "GET",
     cache: false,
     url: "/books/get_book_lists",
     dataType: "jsonp"
  });
}


function updateBookListsJson( book_infos ){
  if ( book_infos == null ){ return; }
  var header = '<li><a id="new_book" href="#"><i class="icon-plus"></i> New Book</a></li>' + 
               '<li><a id="remove_book" href="#"><i class="icon-trash"></i> Remove Current Book</a></li>' +
               '<li class="divider"></li>'; 

  var lists = '';
  for(var i = 0; i < book_infos.length; i++ ){ 
    var active_todo_counts = book_infos[i].todo_h + book_infos[i].todo_m + book_infos[i].todo_l + book_infos[i].doing + book_infos[i].waiting;
    lists += '<li id="book_list_' + book_infos[i].id + '">' +
                 '<a href="#" onclick="selectBook(' + book_infos[i].id + ');">' + book_infos[i].name +
                   '<table style="float:right" class="book-counts">' +
                     '<tr>' +
                       '<td><div class="counts-active"   >' + active_todo_counts    + '</div></td>' +
                       '<td><div class="counts todo_h" >' + book_infos[i].todo_h + '</div></td>' +
                       '<td><div class="counts todo"   >' + book_infos[i].todo_m + '</div></td>' +
                       '<td><div class="counts todo_l" >' + book_infos[i].todo_l + '</div></td>' +
                       '<td><div class="counts doing"  >' + book_infos[i].doing  + '</div></td>' +
                       '<td><div class="counts waiting">' + book_infos[i].waiting + '</div></td>' +
                       '<td><div class="counts done"   >' + book_infos[i].done    + '</div></td>' +
                     '</tr>' +
                   '</table>' +
                 '</a>' +
               '</li>';
  }

  $('#book_list').empty();
  $('#book_list').append(header + lists);

  initNewBookAction();
  initRemoveBookAction();
}
 
// 本日の編集した要素にマーカーをつける
function markTodayEdit(){
  markTodayEditWithElem( $('ul li span[id*="_time_"]:contains(' + getTodayStr() + ')') );
}

function markTodayEditById( id ){
  markTodayEditWithElem( $("#edit_link_time_" + id ) );
  markTodayEditWithElem( $("#fixed_time_" + id ) );
}

function markTodayEditWithElem( mark_obj ){
  mark_obj.removeClass("label-info");
  mark_obj.addClass("label-important");
}

function getTodayStr(){
  var now_date = new Date();
  var year = now_date.getFullYear();
  var month = fillZero(now_date.getMonth() + 1);
  var day   = fillZero(now_date.getDate());

  return month + "/" + day;
}

function sendCurrentTodo(id, status, msg) {

  $("#edit_link_time_" + id ).html(getTodayStr());
  $("#fixed_time_" + id ).html(getTodayStr());

  markTodayEditById( id );

  var request_str = "status=" + status + "&msg=" + msg;

   $.ajax({
     type: "PUT",
     cache: false,
     url: "tasks/" + id,
     data: request_str,
     dataType: "jsonp"
   });

}

function updateCountsJson( counts_json ){
  var state_ids = [
                    ['#todo_h_num',  counts_json.todo_h],
                    ['#todo_num',    counts_json.todo_m],
                    ['#todo_l_num',  counts_json.todo_l],
                    ['#doing_num',   counts_json.doing],
                    ['#waiting_num', counts_json.waiting],
                    ['#done_num',    counts_json.done]
                  ];

  for(var i = 0; i < state_ids.length; i++ ){ 
    var state_name = state_ids[i][0];
    var count_num  = state_ids[i][1];
    if ( $(state_name).html() != count_num ){
      $(state_name).hide();
      $(state_name).css("color","red");
      $(state_name).html(count_num);
      $(state_name).fadeIn("normal",function(){ $(this).css("color","black");});
    }
  }
}

function updateTaskJson( update_task ){
  updateCountsJson( update_task.task_counts );
  updateBookListsJson( update_task.all_books );

  if ( update_task.move_task_id != 0 ){
    setTimeout(function(){
      $('#id_' + update_task.move_task_id).slideUp();
    },200);
  }
}

function toggleDisplay(id1,id2) {
  $("#" + id1).hide();
  $("#" + id2).fadeIn();

  return false;
}
 
function updateToDoMsg(from, to) {
  var msg = $(from).val();
  $(to).html(task_display_filter(msg));

  var id = to.slice(5);
  var status = $("#id_" + id).parent().get(0).id;
  sendCurrentTodo(id, status, msg);
}
 
function moveToDone(move_id) {
  var to_status = "done";
  var id = move_id.slice(4);
  var msg = $("#ms_" + id + "_edit" ).val();
  $("#fixed_msg_" + id ).html(task_display_filter(msg));

  $("#edit_link_ms_" + id ).css("display","none");
  $("#edit_form_ms_" + id ).css("display","none");
  $("#fixed_" + id ).css("display","block");

  $(move_id).fadeOut("normal",function(){ $(move_id).prependTo($("#" + to_status)); });
  $(move_id).fadeIn("normal");

  $('#viewSortlist').html("moveToDone " + move_id);

  sendCurrentTodo(id, to_status, msg);
}

function returnToTodo(ret_id){
  var to_status = "todo_m";
  var id = ret_id.slice(4);

  $("#edit_link_ms_" + id ).css("display","block");
  $("#edit_form_ms_" + id ).css("display","none");
  $("#fixed_" + id ).css("display","none");

  $(ret_id).fadeOut("normal",function(){ $(ret_id).prependTo($("#" + to_status)); });
  $(ret_id).fadeIn("normal");

  $('#viewSortlist').html("returnToTodo " + ret_id);

  var msg = $("#ms_" + id + "_edit" ).val();
  sendCurrentTodo(id, to_status, msg);
}

function fillZero( num ){
  if (num < 10){
    return "0" + num;
  }else {
    return num;
  }
}

function deleteTodo( delete_id ) {
  var msg_id = '#msg_' + delete_id.slice(4);
  $('#delete_task_string').html($(msg_id).html());
  $('#delete_task_in').modal('show');

  $('#delete_task_ok_button').click(function(){
    var id = delete_id.slice(4);
    $.ajax({
      type: "DELETE",
      cache: false,
      url: "tasks/" + id,
      dataType: "jsonp"
    });

    $('#delete_task_in').modal('hide')
    $(delete_id).fadeOut("normal",function(){ $(delete_id).remove(); });
    $('#delete_task_ok_button').unbind("click");
    $('#delete_task_cancel_button').unbind("click");
  });

  $('#delete_task_cancel_button').click(function(){
    $('#delete_task_in').modal('hide')
    $('#delete_task_ok_button').unbind("click");
    $('#delete_task_cancel_button').unbind("click");
  });
}

function addTodoWithPrefix( prefix, msg ){
  if ( msg == "" ){
    return;
  }

  var prefix_text = "";
  if ( prefix != "" ){
    prefix_text = "[" + prefix + "]";
  }

  addTodoAjax( prefix_text + " " + msg );
}

function addTodoAjax(msg) {
  $.ajax({
    type: "POST",
    cache: false,
    url: "tasks",
    data: "msg=" + escapeInvalidChar(msg),
    dataType: "jsonp"
 });
}

function escapeInvalidChar(msg){
  var escaped_msg = msg.replace(/&/g,""); 
  escaped_msg = escaped_msg.replace(/'/g,"\""); 
  escaped_msg = escaped_msg.replace(/!/g,"|"); 
  return escaped_msg;
}

function addTodoResponse(add_task_info){
  var id_str = '#id_' + add_task_info.id;

  $('#todo_m').prepend(add_task_info.li_html);

  markTodayEditById(add_task_info.id);
  updateCountsJson(add_task_info.task_counts);
  updateBookListsJson(add_task_info.all_books);
    
  if ( add_task_info.move_task_id != 0 ){
    setTimeout(function(){
      $('#id_' + add_task_info.move_task_id).slideUp();
    },700);
  }

  //IE の場合はタッチイベントを設定しない
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("msie") <= -1) {
    var label_elemens = $(id_str).get(0).getElementsByClassName("taskLabel");

    var i = 0;
    for(i=0;i < label_elemens.length;i++){
      addMouseEventListener(label_elemens[i]);
    }
  }

  $(id_str).fadeIn();
}

function realize_task(id, msg_array){
  var msg = msg_array.join('\n');

  $('#ms_' + id + '_edit').val(msg);
  $('#msg_' + id ).html(task_display_filter(msg));
  $('#fixed_msg_' + id ).html(task_display_filter(msg));

  $('#ms_' + id + '_edit').maxlength({
    'feedback' : '.task-chars-left'
  });

  $('#check_done_' + id).click(function(){
    moveToDone('#id_' + id);
    return false;
  });

  $('#check_return_' + id).click(function(){
    returnToTodo('#id_' + id);
    return false;
  });

  $('#delete_button_' + id ).click(function(){
    deleteTodo('#id_' + id );
    return false;
  });

  $('#fixed_delete_button_' + id ).click(function(){
    deleteTodo('#id_' + id );
    return false;
  });

  $('#edit_button_' + id ).click(function(){
    autoLoadingTimer.stop();
    $('#id_' + id ).parent().sortable('destroy');
    var org_msg = $('#ms_' + id + '_edit').val();

    toggleDisplay('edit_link_ms_' + id ,'edit_form_ms_' + id );
    $('#ms_' + id + '_edit').get(0).focus();

    $('#edit_form_' + id ).submit(function(){
      autoLoadingTimer.start();
      $('#id_' + id ).parent().sortable(option);
      updateToDoMsg('#ms_' + id + '_edit', '#msg_' + id );
      toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      return false;
    });

    $('#edit_cancel_' + id ).click(function(){
      autoLoadingTimer.start();
      $('#id_' + id ).parent().sortable(option);

      $('#ms_' + id + '_edit').val(org_msg);
      toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      return false;
    });

    return false;
  });
}

function filterTask(filter_str){
  autoLoadingTimer.stop();
  var request_str = "filter=" + filter_str;

  loadingTasklist();

  $.ajax({
     type: "POST",
     cache: false,
     url: "tasks/filter_or_update",
     data: request_str,
     dataType: "jsonp"
  });
}

var LoadingMsg = [
  "タスクの[xxx]を既存の Book名に変更することで Book間の移動ができます",
  "タスクの[xxx]を新しい Book名に変更することで新しい Book が追加されます",
  "タスク内容では簡単な html タグが使用できます",
  "URL は自動的にリンクに変換します",
  "画像URLを貼り付けると画像を表示します",
  "Bookを削除すると Book 内に含まれるタスクも削除されますので注意！",
  "タスク内に書き込める文字数は 200文字です",
  "「Layout」メニューでタスクの表示方法を変更できます",
  "自動更新機能は多人数で使う場合に便利です",
  "自動更新機能は操作が無い場合に５秒間隔で最新の状態に更新します",
  "「Books」メニュー内の並び順は残タスクが多い順になっています",
  "iPad でも使えます",
  "Doingはなるべく１つにしたほうがいいです",
  "定期的に長く放置されたタスクを整理しましょう",
  "たまには壁紙を変えて気分転換しましょう！",
  "Doingにタスクが溜まってきたら危険信号",
  "やらないと決めてタスクを削除する勇気",
  '<i class="icon-list"></i> で完了したタスクのリストページを表示します',
  '<i class="icon-envelope"></i> で表示しているリストをメール送信できます',
  '<i class="icon-picture"></i> で背景画像を設定できます',
  '<i class="icon-refresh"></i> で自動更新機能の ON/OFF ができます'
];

function loadingTasklist(){
  var msg_no = Math.floor(Math.random() * LoadingMsg.length);
  $('#loading_msg').html(LoadingMsg[msg_no]);

  $('#task_list').fadeOut('fast',function(){
    $('#loader').fadeIn();
  });
}

function loadingTasklistEnd(){
  $('#loader').fadeOut('fast',function(){
    $('#task_list').fadeIn('fast', function(){
      $('#add_todo_form_msg').focus();
    });
  });
}

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

function newBook(book_name){
  autoLoadingTimer.stop();
  var filter_param = "filter=" + $('#filter_str').get(0).value;
  var request_str = "book_name=" + book_name + "&" + filter_param;

  loadingTasklist();

  $.ajax({
     type: "POST",
     cache: false,
     url: "books",
     data: request_str,
     dataType: "jsonp"
  });
}

function selectBook(book_id){
  autoLoadingTimer.stop();
  var request_str = "filter=" + $('#filter_str').get(0).value;

  loadingTasklist();

  $.ajax({
     type: "GET",
     cache: false,
     url: "books/" + book_id,
     data: request_str,
     dataType: "jsonp"
  });
}

function updateBookJson(book_info){
  last_task_list_html = book_info.task_list_html;

  $('#task_list').html(book_info.task_list_html);
  loadingTasklistEnd();

  $('#book_name_label').text(book_info.book_name);
  $('#prefix').val(book_info.prefix);

  updateBookListsJson( book_info.all_books );
  updateCountsJson( book_info.task_counts );

  initForTaskList();
  touch_init();
  autoLoadingTimer.startForce();
}

function updateSilentJson(book_info){
  if ( autoLoadingTimer.isActive() == false ){ return; }
  if ( last_task_list_html == book_info.task_list_html){ return; }
  last_task_list_html = book_info.task_list_html;

  $('#task_list').html(book_info.task_list_html);
  $('#add_todo_form_msg').focus();

  updateBookListsJson( book_info.all_books );
  updateCountsJson( book_info.task_counts );

  initForTaskList();
  touch_init();
}

function showMailResult(data){
  $('#sending_mail').hide();
  $('#send_mail_result').html("<strong>Success!</strong> sent the mail to " + data.addr);
  $('#send_mail_result').fadeIn();
  setTimeout(function(){
    $('#send_mail_result').fadeOut();
    },5000);
}

function task_display_filter(text){
  var linked_text = text.replace(/((https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+))/g,
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

function selectLayout(layout_name){
  autoLoadingTimer.stop();
  var request_str = "filter=" + $('#filter_str').get(0).value;
  request_str += "&layout=" + layout_name;

  loadingTasklist();

  $.ajax({
     type: "POST",
     cache: false,
     url: "tasks/filter_or_update",
     data: request_str,
     dataType: "jsonp"
  });
}



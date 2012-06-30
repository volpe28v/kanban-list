/*
 * todo.js
 * created by Naoki Kodama
 */
var COOKIE_EXPIRES = 365;
var COOKIE_MAIL_ADDR = 'kanbanlist_mail_addr';

$(document).ready(function(){ 
    initForTaskList();
    touch_init();
    initNavBooks();
    initSendMail();
    initRemoveBook();

    $('#add_todo_form_msg').focus();

    return;
});

function initNavBooks(){
  $('#new_book').click(function(){
    $('#book_in').modal('show');
    setTimeout(function(){
      $('#book_name').focus();
    },500);
  });

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

function initRemoveBook(){
  $('#remove_book').click(function(){
    $('#remove_book_in').modal('show');
  });

  $('#remove_book_button').click(function(){
    $('#remove_book_in').modal('hide');

    loadingTasklist();

    var dummy_id = 0

    $.ajax({
      type: "DELETE",
      cache: false,
      url: "books/" + dummy_id,
      dataType: "jsonp"
    });
  });

  $('#remove_book_cancel_button').click(function(){
    $('#remove_book_in').modal('hide');
  });
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
			touch_event.screenX, touch_event.screenY, 
			touch_event.clientX, touch_event.clientY, false, 
	        false, false, false, 0, null);

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
        var update_id = ui.item.attr("id").slice(3);
          //$("#msg_" + update_id).css("color","red");
        },
    stop   : function(event, ui){
        var update_id = ui.item.attr("id").slice(3);
          //$("#msg_" + update_id).css("color","#222");           
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

function getTodayFullStr(){
  var now_date = new Date();
  var year = now_date.getFullYear();
  var month = fillZero(now_date.getMonth() + 1);
  var day   = fillZero(now_date.getDate());

  return year + "-" + month + "-" + day;
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

// Todo数表示を更新する
function updateCounts( counts_array ){
    if ( counts_array.length != 6 ){
      return;
    }

    var state_ids = [
                      ['#todo_h_num',  counts_array[0]],
                      ['#todo_num',    counts_array[1]],
                      ['#todo_l_num',  counts_array[2]],
                      ['#doing_num',   counts_array[3]],
                      ['#waiting_num', counts_array[4]],
                      ['#done_num',    counts_array[5]]
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
  jConfirm('Are you sure?','TodoList - delete task -',function(r){
    if(r){
    var id = delete_id.slice(4);
    $.ajax({
      type: "DELETE",
      cache: false,
      url: "tasks/" + id,
      dataType: "jsonp"
    });

    $(delete_id).fadeOut("normal",function(){ $(delete_id).remove(); });
    }
  });
}

function addTodoWithPrefix( prefix, msg ){
  if ( msg == "" ){
    return;
  }

  var prefix_text = "";
  if ( prefix != "" ){
    prefix_text = "【" + prefix + "】";
  }

  addTodoAjax( prefix_text + msg );
}

function addTodoAjax(msg) {
//TODO: エスケープ処理しないとまずい。& ! ' など
  msg = msg.replace(/&/g,""); 
  msg = msg.replace(/'/g,"\""); 
  msg = msg.replace(/!/g,"|"); 

  $.ajax({
    type: "POST",
    cache: false,
    url: "tasks",
    data: "msg=" + msg,
    dataType: "jsonp"
 });
}

//function addTodoResponse(id, li_html, counts_json){
function addTodoResponse(add_task_info){
  var id_str = '#id_' + add_task_info.id;

  $('#todo_m').prepend(add_task_info.li_html);

  markTodayEditById( add_task_info.id );
  updateCountsJson(add_task_info.task_counts)

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
    $('#id_' + id ).parent().sortable('destroy');
    var org_msg = $('#ms_' + id + '_edit').val();

    toggleDisplay('edit_link_ms_' + id ,'edit_form_ms_' + id );
    $('#ms_' + id + '_edit').get(0).focus();

    $('#edit_form_' + id ).submit(function(){
      $('#id_' + id ).parent().sortable(option);
      updateToDoMsg('#ms_' + id + '_edit', '#msg_' + id );
      toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      return false;
    });

    $('#edit_cancel_' + id ).click(function(){
      $('#id_' + id ).parent().sortable(option);

      $('#ms_' + id + '_edit').val(org_msg);
      toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      return false;
    });

    return false;
  });
}

function changeBgImg(img_name) {
  document.body.style.backgroundImage = 'url(/bg_img/' + img_name + ')';

  $.ajax({
    type: "POST",
    cache: false,
    url: "todo.cgi",
    data: "mode=setbgurl&name=" + CurrentUser + "&bg_url=" + img_name,
    success: function(result){
       $('#viewSortlist').html(result );
//     alert( "bg_changed");
    }
 });

}

function changeLayout(layout) {

  $.ajax({
    type: "POST",
    cache: false,
    url: "todo.cgi",
    data: "mode=setlayout&name=" + CurrentUser + "&layout=" + layout,
    success: function(result){
       $('#viewSortlist').html(result );
       filterTask( $('#filter_str').get(0).value );
    }
 });

}

function newUser( url_name , user_name ) {
  if ( user_name != "" ){
    location.href = url_name + '/todo.cgi?mode=new&name=' + user_name;
  }else{
    alert("Please input new user name!");
  }
}

function filterTask(filter_str){
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

function loadingTasklist(){
  $('#task_list').fadeOut();
  $('#loader').fadeIn();
}

function newBook(book_name){
  var request_str = "book_name=" + book_name;

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
  var request_str = "book_id=" + book_id;

  loadingTasklist();

  $.ajax({
     type: "GET",
     cache: false,
     url: "books/" + book_id,
     dataType: "jsonp"
  });
}

function updateBookJson(book_info){
  $('#loader').hide();
  $('#task_list').html(book_info.task_list_html);
  $('#task_list').fadeIn('fast', function(){
        $('#add_todo_form_msg').focus();
      }
    );

  if (book_info.new_book != null){
    $('#book_list').append('<li id="book_list_' + book_info.new_book.id + '"><a href="#" onclick="selectBook(' + book_info.new_book.id + ');">' + book_info.new_book.name + '</a></li>');
  }
  if (book_info.remove_book != null){
    $('#book_list_' + book_info.remove_book.id).remove();
  }

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
  return linked_text;
}


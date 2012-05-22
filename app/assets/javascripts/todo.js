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
  var addr = $.cookie(COOKIE_MAIL_ADDR) || "";
  $('#mail_addr').val(addr);

  $('#send_mail').click(function(){
    $('#mail_in').modal('show');
    setTimeout(function(){
      $('#mail_addr').focus();
    },500);
  });

  var send_mail_action = function(){
    var addr = $('#mail_addr').val();
    if ( addr != "" ){
      $('#sending_mail').text('Sending email to ' + addr);
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
                         $("#msg_" + update_id).html());
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

function toggleDisplay(id1,id2) {
//  $("#" + id1).toggle();
//  $("#" + id2).toggle();

  $("#" + id1).hide();
  $("#" + id2).fadeIn();

  return false;
}
 
function updateToDoMsg(from, to) {
  $(to).html($(from).get(0).value);

  var id = to.slice(5);
  var status = $("#id_" + id).parent().get(0).id;
  var msg = $(to).html();
  sendCurrentTodo(id, status, msg);

}
 
function moveToDone(move_id) {
  var to_status = "done";
  var id = move_id.slice(4);
  $("#fixed_msg_" + id ).html($("#msg_" + id ).html());

  $("#edit_link_ms_" + id ).css("display","none");
  $("#edit_form_ms_" + id ).css("display","none");
  $("#fixed_" + id ).css("display","block");

  $(move_id).fadeOut("normal",function(){ $(move_id).prependTo($("#" + to_status)); });
  $(move_id).fadeIn("normal");

  $('#viewSortlist').html("moveToDone " + move_id);

  var msg = $("#msg_" + id).html();
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

  var msg = $("#msg_" + id).html();
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
    data: "msg=" + msg
 });
}

function addTodoResponse(id, li_html, counts_json){
  var id_str = '#id_' + id;

  $('#todo_m').prepend(li_html);

  markTodayEditById( id );
  updateCountsJson(counts_json)

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

  $('#task_list').fadeOut();

  $.ajax({
     type: "POST",
     cache: false,
     url: "tasks/filter_or_update",
     data: request_str,
     dataType: "jsonp"
  });
}

function newBook(book_name){
  var request_str = "book_name=" + book_name;

  $('#task_list').fadeOut();

  $.ajax({
     type: "POST",
     cache: false,
     url: "tasks/new_book",
     data: request_str,
     dataType: "jsonp"
  });
}

function selectBook(book_id){
  var request_str = "book_id=" + book_id;

  $('#task_list').fadeOut();

  $.ajax({
     type: "GET",
     cache: false,
     url: "tasks/select_book",
     data: request_str,
     dataType: "jsonp"
  });
}

function updateBookJson(book_info){
  $('#task_list').html(book_info.task_list_html);
  $('#task_list').fadeIn('fast', function(){
        $('#add_todo_form_msg').focus();
      }
    );

  if (book_info.new_book != null){
    $('#book_list').append('<li><a href="#" onclick="selectBook(' + book_info.new_book.id + ');">' + book_info.new_book.name + '</a></li>');
  }
  updateCountsJson( book_info.task_counts );
  initForTaskList();
  touch_init();
}

function showMailResult(data){
  $('#sending_mail').hide();
  $('#send_mail_result').text("sent the mail to " + data.addr);
  $('#send_mail_result').fadeIn();
  setTimeout(function(){
    $('#send_mail_result').fadeOut();
    },5000);


}


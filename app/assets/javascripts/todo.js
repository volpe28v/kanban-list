/*
 * todo.js
 * created by Naoki Kodama
 */
var last_task_list_html = "";
KanbanList.namespace('draggableTask');
KanbanList.draggableTask = (function(){
  var autoLoadingTimer = KanbanList.autoLoadingTimer;
  var handlers = {};

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
      if (handlers.receive == undefined){ return; }
      var update_id = ui.item.attr("id").slice(3);

      handlers.receive( update_id,
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

  function setHandlers(handlers_hash){
    handlers = handlers_hash;
  }

  // ドラッグ＆ドロップ可能にする
  function startAll(){
    $("#doing, #waiting, #todo_m, #todo_l, #todo_h" ).sortable(option).enableSelection();
  }

  function startByElem(elem){
    elem.sortable(option);
  }

  function stopByElem(elem){
    elem.sortable('destroy');
  }

  return {
    setHandlers: setHandlers,
    startAll:    startAll,
    startByElem: startByElem,
    stopByElem:  stopByElem
  }
}());

// dependent modules 
var autoLoadingTimer = KanbanList.autoLoadingTimer;
var utility = KanbanList.utility;
var ajaxLoader = KanbanList.ajaxLoader;
var touchEvent = KanbanList.touchEvent;
var backgroundImage = KanbanList.backgroundImage;
var bookNavi = KanbanList.bookNavi;
var sendMail = KanbanList.sendMail;
var todayMarker = KanbanList.todayMarker;
var draggableTask = KanbanList.draggableTask;

$(document).ready(function(){ 
  bookNavi.init();
  sendMail.init();
  autoLoadingTimer.init();
  backgroundImage.init();

  draggableTask.setHandlers({receive: sendCurrentTodo});

  $('a[rel=tooltip]').tooltip({ placement:"bottom"});
  return;
});

function initForTaskList(){
//  setSortableList();
  draggableTask.startAll();
  todayMarker.markAll();
}

function sendCurrentTodo(id, status, msg) {

  $("#edit_link_time_" + id ).html(utility.getTodayStr());
  $("#fixed_time_" + id ).html(utility.getTodayStr());

  todayMarker.markById( id );

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
  bookNavi.updateByJson( update_task.all_books );

  if ( update_task.move_task_id != 0 ){
    setTimeout(function(){
      $('#id_' + update_task.move_task_id).slideUp();
    },200);
  }
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

function addTodoResponse(add_task_info){
  var id_str = '#id_' + add_task_info.id;

  $('#todo_m').prepend(add_task_info.li_html);

  todayMarker.markById(add_task_info.id);
  updateCountsJson(add_task_info.task_counts);
  bookNavi.updateByJson( add_task_info.all_books );
    
  if ( add_task_info.move_task_id != 0 ){
    setTimeout(function(){
      $('#id_' + add_task_info.move_task_id).slideUp();
    },700);
  }

  var label_elems = $(id_str).get(0).getElementsByClassName("taskLabel");
  touchEvent.setEvent(label_elems);

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
    draggableTask.stopByElem($('#id_' + id ).parent());

    var org_msg = $('#ms_' + id + '_edit').val();

    utility.toggleDisplay('edit_link_ms_' + id ,'edit_form_ms_' + id );
    $('#ms_' + id + '_edit').get(0).focus();

    $('#edit_form_' + id ).submit(function(){
      autoLoadingTimer.start();
      draggableTask.startByElem($('#id_' + id ).parent());
      updateToDoMsg('#ms_' + id + '_edit', '#msg_' + id );
      utility.toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      return false;
    });

    $('#edit_cancel_' + id ).click(function(){
      autoLoadingTimer.start();
      draggableTask.startByElem($('#id_' + id ).parent());

      $('#ms_' + id + '_edit').val(org_msg);
      utility.toggleDisplay('edit_form_ms_' + id ,'edit_link_ms_' + id );
      return false;
    });

    return false;
  });
}

function filterTask(filter_str){
  autoLoadingTimer.stop();
  var request_str = "filter=" + filter_str;

  ajaxLoader.start(function(){
    $.ajax({
      type: "POST",
      cache: false,
      url: "tasks/filter_or_update",
      data: request_str,
      dataType: "jsonp"
    });
  });
}

function updateBookJson(book_info){
  last_task_list_html = book_info.task_list_html;

  $('#task_list').html(book_info.task_list_html);
  ajaxLoader.stop();

  $('#book_name_label').text(book_info.book_name);
  $('#prefix').val(book_info.prefix);

  bookNavi.updateByJson(book_info.all_books);
  updateCountsJson( book_info.task_counts );

  initForTaskList();
  touchEvent.init("taskLabel");
  autoLoadingTimer.startForce();
}

function updateSilentJson(book_info){
  if ( autoLoadingTimer.isActive() == false ){ return; }
  if ( last_task_list_html == book_info.task_list_html){ return; }
  last_task_list_html = book_info.task_list_html;

  $('#task_list').html(book_info.task_list_html);
  $('#add_todo_form_msg').focus();

  bookNavi.updateByJson( book_info.all_books );
  updateCountsJson( book_info.task_counts );

  initForTaskList();
  touchEvent.init("taskLabel");
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

  ajaxLoader.start(function(){
    $.ajax({
       type: "POST",
       cache: false,
       url: "tasks/filter_or_update",
       data: request_str,
       dataType: "jsonp"
    });
  });
}



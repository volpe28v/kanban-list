/*
 * todo.js
 * created by Naoki Kodama
 */

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

// global
var last_task_list_html = "";

$(document).ready(function(){ 
  // initialize menus
  bookNavi.init();
  sendMail.init();
  autoLoadingTimer.init();
  backgroundImage.init();

  // initialize modules
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



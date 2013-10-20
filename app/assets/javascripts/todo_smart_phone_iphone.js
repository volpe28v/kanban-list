//= require kanbanlist
//= require task_action_smart_phone_iphone
//= require add_todo_form_smart_phone_iphone
//= require draggable_task_smart_phone_iphone

/*
 * todo.js
 * created by Naoki Kodama
 */
var COOKIE_EXPIRES = 365;
var COOKIE_MAIL_ADDR = 'kanbanlist_mail_addr';

var draggableTask = KanbanList.draggableTask;
var taskAction = KanbanList.taskAction;

// for jQuery mobile initialize
$(document).bind("mobileinit", function(){
  $.extend( $.mobile, {
    ajaxEnabled: false
  });
});

$(document).ready(function(){
  initForTaskList();
  initNavBooks();
  initSendMail();

  // initialize modules
  draggableTask.setHandlers({receive: sendCurrentTodoMoving,
                             update_order: sendCurrentOrder
                            });

  draggableTask.startAll();

  // この数値以上、横スワイプしたときにイベントを発生
  $.event.special.swipe.horizontalDistanceThreshold = 60;

  // フリック・スワイプ画面遷移
  $("#todo_nav").bind("swipeleft", function(){
      $.mobile.changePage('#doing_nav' , { transition: "slide"} );
  });

  $("#doing_nav").bind("swiperight", function(){
    $.mobile.changePage('#todo_nav', { transition: 'slide', reverse: true});
  });

  $("#doing_nav").bind("swipeleft", function(){
    $.mobile.changePage('#done_nav', { transition: 'slide', reverse: false});
  });

  $("#done_nav").bind("swiperight", function(){
    $.mobile.changePage('#doing_nav', { transition: 'slide', reverse: true});
  });

  $("#done_nav").bind("swipeleft", function(){
    $.mobile.changePage('#option', { transition: 'slide', reverse: false});
  });

  $("#option").bind("swiperight", function(){
    $.mobile.changePage('#done_nav', { transition: 'slide', reverse: true});
  });

  $(".swipe-back").bind("swiperight", function(){
    history.back();
  });

  // タスク編集画面を出すためにpagebeforechangeを監視
  $(document).bind( "pagebeforechange", function( e, data ) {
    if ( typeof data.toPage === "string" ) {
      var u = $.mobile.path.parseUrl( data.toPage ),
          re = /^#setting/;
      if ( u.hash.search(re) !== -1 ) {
        var $page = taskAction.get_setting_page(u.hash);
        $page.page();
        $.mobile.changePage( $page, data.options );

        e.preventDefault();
      }
      return true;
    }
  });

  // リストのスタイル更新を呼ぶためにpagechangeを監視
  $(document).bind( "pagechange", function( e, data ) {
    if ( typeof data.toPage.context.URL === "string" ) {
      var u = $.mobile.path.parseUrl( data.toPage.context.URL ),
          todo_re = /^#todo_nav/,
          doing_re = /^#doing_nav/,
          done_re = /^#done_nav/;

      if ( u.hash.search(todo_re) !== -1 || u.hash == "") {
        $("#todo_h").listview('refresh');
        $("#todo_m").listview('refresh');
        $("#todo_l").listview('refresh');
      }else if ( u.hash.search(doing_re) !== -1 ) {
        $("#doing").listview('refresh');
        $("#waiting").listview('refresh');
      }else if ( u.hash.search(done_re) !== -1 ) {
        $("#done").listview('refresh');
      }
    }
  });

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
  $.ajax({
    type: "POST",
    cache: false,
    url: "tasks/send_mail",
    data: {
      mail_addr: addr
    },
    dataType: "jsonp"
  });
}

function initForTaskList(){
    $("#add_todo_form input:submit").button();
    markTodayEdit();
}

// 本日の編集した要素にマーカーをつける
function markTodayEdit(){
  markTodayEditWithElem( $('ul li span[id*="updated_"]:contains(' + getTodayStr() + ')') );
}

function markTodayEditById( id ){
  markTodayEditWithElem( $("#updated_" + id ) );
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

function sendCurrentTodoMoving(id, from_id, to_id) {
  taskAction.changeStatus(id, from_id, to_id);
}

function sendCurrentOrder(status, order) {
  taskAction.changeOrder(status, order);
}

function sendCurrentTodo(id, status, msg) {
  $("#updated_" + id ).html(getTodayStr());

  markTodayEditById( id );

  $.ajax({
    type: "PUT",
    cache: false,
    url: "tasks/" + id,
    data: {
      status: status,
      msg: msg
    },
    dataType: "jsonp"
  });
}

function sendTaskOrder(status, order){
    var request_str = "status=" + status + "&" + order; //TODO hash で渡したいが、バラすのが面倒なので後回し
      $.ajax({
            type: "POST",
            cache: false,
            url: "tasks/update_order",
            data: request_str
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
    var id = delete_id.slice(4);
    $.ajax({
      type: "DELETE",
      cache: false,
      url: "tasks/" + id,
      dataType: "jsonp"
    });

    setTimeout(function(){
      $(delete_id).fadeOut("normal",function(){ $(delete_id).remove(); });
      },500);
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
    data: {
      msg: msg
    }
 });
}

function addTodoResponse(add_task_info){
  $("#todo_m_label").after(add_task_info.li_html);
  $('#todo_m').listview('refresh');
  markTodayEditById( add_task_info.id );
}

function filterTask(filter_str){
  $('#task_list').fadeOut();

  $.ajax({
    type: "POST",
    cache: false,
    url: "tasks/filter_or_update",
    data: {
      filter: filter_str
    },
    dataType: "jsonp"
  });
}

function newBook(book_name){
  $('#task_list').fadeOut();

  $.ajax({
    type: "POST",
    cache: false,
    url: "tasks/new_book",
    data: {
      book_name: book_name
    },
    dataType: "jsonp"
  });
}

function selectBook(book_id){
  $('#task_list').fadeOut();

  $.ajax({
    type: "GET",
    cache: false,
    url: "tasks/select_book",
    data: {
      book_id: book_id
    },
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
}

function showMailResult(data){
  $('#sending_mail').hide();
  $('#send_mail_result').html("<strong>Success!</strong> sent the mail to " + data.addr);
  $('#send_mail_result').fadeIn();
  setTimeout(function(){
    $('#send_mail_result').fadeOut();
  },5000);
}

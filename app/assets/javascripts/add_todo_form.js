$(document).ready(function(){ 
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

  function addTodoAction(){
    addTodoWithPrefix($('#prefix').val() , $('#add_todo_form_msg').val());
    $('#add_todo_form_msg').val('');
    $('#add_todo_form_msg').focus();
 
    $("#add_todo_form_msg").maxlength({
      'feedback' : '.task-chars-left-add-form'
    });
  }
 
  $("#add_todo_form_msg").maxlength({
    'feedback' : '.task-chars-left-add-form'
  });

  $("#add_todo_form").submit(function(){
    addTodoAction();
    return false;
  });

  $("#add_todo_button").click(function(){
    addTodoAction();
  });

  filterTask("");
});

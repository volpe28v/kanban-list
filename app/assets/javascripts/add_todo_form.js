$(document).ready(function(){
  function addTodoWithPrefix( prefix, msg, priority ){
    if ( msg == "" ){
      return;
    }

    var prefix_text = "";
    if ( prefix != "" ){
      prefix_text = "[" + prefix + "]";
    }

    addTodoAjax( prefix_text + " " + msg, priority );
  }

  function addTodoAjax(msg, priority) {
    priority = priority == null ? "todo_m" : priority;
    $.ajax({
      type: "POST",
      cache: false,
      url: "tasks",
      data: {
        msg: escapeInvalidChar(msg),
        priority: priority
      },
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
    addTodoWithPrefix(
      $('#prefix').val() , sanitize($('#add_todo_form_msg').val()),
      $('input[name="add_to"]:checked').val()
    );

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

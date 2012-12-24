KanbanList.namespace('addForm');
KanbanList.addForm = (function(){
  function initial(current_book){
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
     });
    }

    function escapeInvalidChar(msg){
      var escaped_msg = msg.replace(/&/g,""); 
      escaped_msg = escaped_msg.replace(/'/g,"\""); 
      escaped_msg = escaped_msg.replace(/!/g,"|"); 
      return escaped_msg;
    }

    var is_added_task = false;
    function addTodoAction(){
      addTodoWithPrefix($('#prefix').val() , sanitize($('#add_todo_form_msg').val()));
      $('#add_todo_form_msg').val('');

      is_added_task = true;
    }
 
    $("#add_todo_form_msg").maxlength({
      'feedback' : '.task-chars-left-add-form'
    });

    $("#add_todo_form").submit(function(){
      addTodoAction();
      return false;
    });

    $('#todo_nav').delegate('#add_todo_button', 'click',function(){
      addTodoAction();
    });

    $('#prefix').val(current_book.name);
    $('#return_book').click(function(){
      if ( is_added_task ){
        location.href="tasks?book_id=" + current_book.id;
      }else{
        history.back();
      }
    });
  }

  return {
    initial: initial
  }
}());


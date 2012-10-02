KanbanList.namespace('taskAction');
KanbanList.taskAction = (function(){
  var draggableTask = KanbanList.draggableTask;
  var autoLoadingTimer = KanbanList.autoLoadingTimer;
  var utility = KanbanList.utility;

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

    //TODO: グローバルのメソッドを呼んでいるので修正する
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
    //TODO: グローバルのメソッドを呼んでいるので修正する
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

  function updateToDoMsg(from, to) {
    var msg = sanitize($(from).val());
    $(from).val(msg);
    $(to).html(task_display_filter(msg));

    var id = to.slice(5);
    var status = $("#id_" + id).parent().get(0).id;
    //TODO: グローバルのメソッドを呼んでいるので修正する
    sendCurrentTodo(id, status, msg);
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

  return {
    realize: realize_task
  }
}());



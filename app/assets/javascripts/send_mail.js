KanbanList.namespace('sendMail');

KanbanList.sendMail = (function(){

  var COOKIE_EXPIRES = 365;
  var COOKIE_MAIL_ADDR = 'kanbanlist_mail_addr';

  function init(){
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
      var comment = $('#mail_comment').val();
      if ( addr != "" ){
        $('#sending_mail').html('<strong>Processing...</strong> sending email to ' + addr);
        $('#sending_mail').fadeIn();
        send_mail(addr, comment);
        $('#mail_in').modal('hide')
        $.cookie(COOKIE_MAIL_ADDR,addr,{ expires: COOKIE_EXPIRES });
      }
    };

    $('#mail_form').submit(function(){
      send_mail_action();
      return false;
    });

    $('#mail_comment_form').submit(function(){
      send_mail_action();
      return false;
    });

    $('#send_mail_button').click(function(){
      send_mail_action();
    });
  }

  function send_mail(addr, comment){
    $.ajax({
      type: "POST",
      cache: false,
      url: "tasks/send_mail",
      data: {
        mail_addr: addr,
        comment: comment
      },
      dataType: "jsonp"
    });
  }

  return {
    init: init
  }
}());

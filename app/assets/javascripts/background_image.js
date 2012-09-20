// BackgroundImage
KanbanList.namespace('backgroundImage');

KanbanList.backgroundImage = (function(){
  // private
  var COOKIE_EXPIRES = 365;
  var COOKIE_BG_IMAGE = 'kanbanlist_bg_image_url';

  function setBgImage(image_url){
    $("#body_core").css('background-image','url(' + image_url + ')');
  }

  // public
  function init(){
    var image_url = $.cookie(COOKIE_BG_IMAGE);
    $('#image_url').val(image_url);
    setBgImage(image_url);

    $('#set_bg_image').click(function(){
      $('#bg_image_in').modal('show');
      setTimeout(function(){
        $('#image_url').focus();
      },500);
    });

    var set_bg_image_action = function(){
      var image_url = $('#image_url').val();
      setBgImage(image_url);
      $('#bg_image_in').modal('hide')
      $.cookie(COOKIE_BG_IMAGE,image_url,{ expires: COOKIE_EXPIRES });
    };

    $('#bg_image_form').submit(function(){
      set_bg_image_action();
      return false;
    });

    $('#set_bg_image_button').click(function(){
      set_bg_image_action();
    });
  }

  return {
    // public
    init: init
  }
}());


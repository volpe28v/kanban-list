jQuery(function($) {
  $(document).ajaxSend(function(event, xhr, settings) {
    if (settings.type !== 'GET') {
      xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
    }
  });
});

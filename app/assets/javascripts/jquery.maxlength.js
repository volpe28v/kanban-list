/*
  @author: remy sharp / http://remysharp.com
  @params:
    feedback - the selector for the element that gives the user feedback. Note that this will be relative to the form the plugin is run against.
    hardLimit - whether to stop the user being able to keep adding characters. Defaults to true.
    useInput - whether to look for a hidden input named 'maxlength' instead of the maxlength attribute. Defaults to false.
    words - limit by characters or words, set this to true to limit by words. Defaults to false.
  @license: Creative Commons License - ShareAlike http://creativecommons.org/licenses/by-sa/3.0/
  @version: 1.2
  @changes: code tidy via Ariel Flesler and fix when pasting over limit and including \t or \n
*/

(function ($) {

$.fn.maxlength = function (settings) {

    if (typeof settings == 'string') {
        settings = { feedback : settings };
    }

    settings = $.extend({}, $.fn.maxlength.defaults, settings);

    function length(el) {
    	var parts = el.value;
    	if ( settings.words )
    		parts = el.value.length ? parts.split(/\s+/) : { length : 0 };
    	return parts.length;
    }
    
    return this.each(function () {
        var field = this,
        	$field = $(field),
        	$form = $(field.form),
        	limit = settings.useInput ? $form.find('input[name=maxlength]').val() : $field.attr('maxlength'),
        	$charsLeft = $form.find(settings.feedback);

    	function limitCheck(event) {
        	var len = length(this),
        	    exceeded = len >= limit,
        		code = event.keyCode;

        	if ( !exceeded )
        		return;

            switch (code) {
                case 8:  // allow delete
                case 9:
                case 17:
                case 36: // and cursor keys
                case 35:
                case 37: 
                case 38:
                case 39:
                case 40:
                case 46:
                case 65:
                    return;

                default:
                    return settings.words && code != 32 && code != 13 && len == limit;
            }
        }


        var updateCount = function () {
            var len = length(field),
            	diff = limit - len;

            $charsLeft.html( diff || "0" );

            // truncation code
            if (settings.hardLimit && diff < 0) {
            	field.value = settings.words ? 
            	    // split by white space, capturing it in the result, then glue them back
            		field.value.split(/(\s+)/, (limit*2)-1).join('') :
            		field.value.substr(0, limit);

                updateCount();
            }
        };

        $field.keyup(updateCount).change(updateCount);
        if (settings.hardLimit) {
            $field.keydown(limitCheck);
        }

        updateCount();
    });
};

$.fn.maxlength.defaults = {
    useInput : false,
    hardLimit : true,
    feedback : '.charsLeft',
    words : false
};

})(jQuery);
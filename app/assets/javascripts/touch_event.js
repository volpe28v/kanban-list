// TouchEvent
KanbanList.namespace('touchEvent');

KanbanList.touchEvent = (function(){
  // private
  function touchHandler(event){
    if (event.touches.length > 1){return;} //マルチタッチを無効化

    var touches = event.changedTouches;
    event.preventDefault();
    var first = touches[0];
    var type = "";
    switch(event.type)
    {
      case "touchstart":
        type = "mousedown";
        break;
      case "touchend":
        type = "mouseup";
        break;
      case "touchmove":
        type = "mousemove";
        break;
      default:
        return;
    }
    dispatchMouseEvent(type, first);
  }

  function dispatchMouseEvent(event_type, touch_event){
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(
      event_type, true, true, window, 1,
      touch_event.screenX,
      touch_event.screenY,
      touch_event.clientX,
      touch_event.clientY,
      false, false, false, false, 0, null);

    touch_event.target.dispatchEvent(simulatedEvent);
  }

  function addMouseEventListener(element){
    element.addEventListener("touchstart",  touchHandler, true);
    element.addEventListener("touchmove",   touchHandler, true);
    element.addEventListener("touchend",    touchHandler, true);
    element.addEventListener("touchcancel", touchHandler, true);
  }

  function setEvent(target_elems){
    var userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("msie") > -1) {
      return;
    }

    var i = 0;
    for(i=0;i < target_elems.length;i++){
      addMouseEventListener(target_elems[i]);
    }
  }

  function init(target_class_name){
    var label_elems = document.getElementsByClassName(target_class_name);
    setEvent(label_elems);
  }

  return {
    // public
    init: init,
    setEvent: setEvent
 }
}());

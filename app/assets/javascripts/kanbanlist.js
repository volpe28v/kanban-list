var KanbanList = (function(){
  function namespace(ns_string){
    var parts = ns_string.split('.'),
        object = this;

    for (var i = 0; i < parts.length; i += 1){
      if (typeof object[parts[i]] === "undefined"){
        object[parts[i]] = {};
      }
      object = object[parts[i]];
    }
    return object;
  }

  return {
    namespace: namespace
  }
}());




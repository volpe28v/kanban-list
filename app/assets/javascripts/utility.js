// Utility functions
KanbanList.namespace('utility');

KanbanList.utility = (function(){
  //private
  function fillZero(num){
    if (num < 10){
      return "0" + num;
    }else {
      return num;
    }
  }
 
  return {
    //public
    getTodayStr: function(){
      var now_date = new Date();
      var year = now_date.getFullYear();
      var month = fillZero(now_date.getMonth() + 1);
      var day   = fillZero(now_date.getDate());

      return month + "/" + day;
    },
    toggleDisplay: function(id1,id2) {
      $("#" + id1).hide();
      $("#" + id2).fadeIn();

      return false;
    }
  }
}());



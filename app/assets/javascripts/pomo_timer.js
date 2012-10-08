KanbanList.namespace('pomodoroTimer');

KanbanList.pomodoroTimer = (function(){
  var Timer1; 

  function start()
  {
    $("#p_start").get(0).disabled=true;
    Timer1 = setInterval(countDown,1000);
  }

  function clear()
  {
    pause();
    reset();
  }

  function pause()
  {
    $("#p_start").get(0).disabled=false;
    clearInterval(Timer1);
  }

  function countDown()
  {
    var min = eval($("#p_min").html());
    var sec = eval($("#p_sec").html());
  
    var remain = (min * 60) + (sec - 1);
    $("#p_min").html(("0" + Math.floor(remain / 60)).slice(-2));
    $("#p_sec").html(("0" + (remain % 60)).slice(-2));
   
    showPopup(remain);
  }

  function showPopup(remain_time)
  {
    if (remain_time <= 0)
    {
      alert("＜ポモドーロタイマー＞\nお疲れさまです、25分経ちましたよ！ \n3〜5分休憩してくださいね。\n※4ポモドーロごとに15〜30分の休憩をとった方がいいですよ。");
      clear();
    }
  }

  function reset()
  {
    $("#p_min").html("25");
    $("#p_sec").html("00");
    clearInterval(Timer1);
  }  
 
  function init(){
    $('#pomo_navi').click(function(){
      $('#p_timer_body').fadeToggle('slow');
      return false;
    });

    $('#p_start').click(function(){
      start();
    });
    $('#p_pause').click(function(){
      pause();
    });
    $('#p_clear').click(function(){
      clear();
    });
  }

  return {
    init: init
  }
}());



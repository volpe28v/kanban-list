KanbanList.namespace('pomodoroTimer');

KanbanList.pomodoroTimer = (function(){
  var Timer1 = null; 
  var DefaultMin = 25;
  var DefaultSec = 0;
  var done_num = 0;

  function isActive(){
    return Timer1 != null;
  }

  function setDecrementTime(min,sec){
    var remain = (min * 60) + (sec - 1);
    var next_min =  Math.floor(remain / 60);
    var next_sec = (remain % 60);
    setTime(next_min, next_sec);
    return remain;
  }
 
  function setTime(min, sec){
    $("#p_min").html(("0" + min).slice(-2));
    $("#p_sec").html(("0" + sec).slice(-2));
  }
  function start()
  {
    $("#p_start").get(0).disabled = true;
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
    Timer1 = null;
  }

  function countDown()
  {
    var min = eval($("#p_min").html());
    var sec = eval($("#p_sec").html());
  
    var remain = setDecrementTime(min, sec);
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
    setTime(DefaultMin, DefaultSec);
    clearInterval(Timer1);
    Timer1 = null;
    $('#pomo_done_num').html(0);
  }  
 
  function init(){
    setTime(DefaultMin, DefaultSec);

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

  function addDone(){
    if (isActive() == false){ return };

    done_num += 1;
    //TODO: Done num を一旦非表示にしている
    // $('#pomo_done_num').html(done_num);
  }

  return {
    init: init,
    addDone: addDone
  }
}());



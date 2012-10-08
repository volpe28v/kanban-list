KanbanList.namespace('pomodoroTimer');

KanbanList.pomodoroTimer = (function(){
  function init(){
    $('#pomo_navi').click(function(){
      $('#p_timer_body').fadeIn('slow');
      return false;
    });

    $('#p_start').click(function(){
      Start();
    });
    $('#p_pause').click(function(){
      Pause();
    });
    $('#p_clear').click(function(){
      Clear();
    });
  }

  return {
    init: init
  }
}());

var Timer1; 

function Start()
{
  $("#p_start").get(0).disabled=true;
  Timer1 = setInterval(CountDown,1000);
}

function Clear()
{
  Pause();
  ReSet();
}

function Pause()
{
  $("#p_start").get(0).disabled=false;
  clearInterval(Timer1);
}

function CountDown()
{
  var min = $("#p_min").html();
  var sec = $("#p_sec").html();
  
  if( (min == "") && (sec == "") )
  {
    alert("set time!");
    ReSet();
  }
  else
  {
    try
    {
      if (min == "") min = 0;
      min = eval(min);
      
      if (sec == "") sec = 0;
      sec = eval(sec);
      
      TMWrite(min*60+sec-1);
    }
    catch(e)
    {
      alert("set digit!");
      ReSet();
    }
  }
}

function TMWrite(int)
{
  int = eval(int);
  
  if (int <= 0)
  {
    $("#p_min").html(("0" + Math.floor(int/60)).slice(-2));
    $("#p_sec").html(("0" + (int % 60)).slice(-2));

    alert("＜ポモドーロタイマー＞\n\tお疲れさまです、25分経ちましたよ！ \n3〜5分休憩してくださいね。\n※4ポモドーロごとに15〜30分の休憩をとった方がいいですよ。");

    Clear();
  }
  else
  {
    $("#p_min").html(("0" + Math.floor(int/60)).slice(-2));
    $("#p_sec").html(("0" + (int % 60)).slice(-2));
  }
}

function ReSet()
{
  $("#p_min").html("25");
  $("#p_sec").html("00");
  clearInterval(Timer1);
}  
 

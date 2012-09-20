// AjaxLoader module
KanbanList.namespace('ajaxLoader');

KanbanList.ajaxLoader = (function(){
  // private
  var LoadingMsg = [
    "タスクの[xxx]を既存の Book名に変更することで Book間の移動ができます",
    "タスクの[xxx]を新しい Book名に変更することで新しい Book が追加されます",
    "タスク内容では簡単な html タグが使用できます",
    "URL は自動的にリンクに変換します",
    "画像URLを貼り付けると画像を表示します",
    "Bookを削除すると Book 内に含まれるタスクも削除されますので注意！",
    "タスク内に書き込める文字数は 200文字です",
    "「Layout」メニューでタスクの表示方法を変更できます",
    "自動更新機能は多人数で使う場合に便利です",
    "自動更新機能は操作が無い場合に５秒間隔で最新の状態に更新します",
    "「Books」メニュー内の並び順は残タスクが多い順になっています",
    "iPad でも使えます",
    "Doingはなるべく１つにしたほうがいいです",
    "定期的に長く放置されたタスクを整理しましょう",
    "たまには壁紙を変えて気分転換しましょう！",
    "Doingにタスクが溜まってきたら危険信号",
    "やらないと決めてタスクを削除する勇気",
    '<i class="icon-list"></i> で完了したタスクのリストページを表示します',
    '<i class="icon-envelope"></i> で表示しているリストをメール送信できます',
    '<i class="icon-picture"></i> で背景画像を設定できます',
    '<i class="icon-refresh"></i> で自動更新機能の ON/OFF ができます'
  ];

  return {
    // public
    start: function(){
      var msg_no = Math.floor(Math.random() * LoadingMsg.length);
      $('#loading_msg').html(LoadingMsg[msg_no]);

      $('#task_list').fadeOut('fast',function(){
        $('#loader').fadeIn();
      });
    },
    stop: function(){
      $('#loader').fadeOut('fast',function(){
        $('#task_list').fadeIn('fast', function(){
          $('#add_todo_form_msg').focus();
        });
      });
    }
  }
}());



#!/usr/bin/ruby

require "rubygems"
require "active_record"
require "cgi"
require "uri"
require "kconv"

# ユーザのTodoテーブル
require "user.rb"

Input = CGI.new
###################################################################
print "Content-type: text/html\n\n";

def main
  # クライアントからの情報を格納
  mode_in   = Input['mode']
  user_name = Input['name']
  id_in     = Input['id']
  status_in = Input['status']
  msg_in    = Input['msg']
  bg_url    = Input['bg_url']
  filter    = Input['filter']
  layout    = Input['layout']

  # モードによって処理を分岐
  case mode_in 
  # 新規作成モードの場合
  when /create/
    # 新規レコードを追加
    todo_elem = TodoTable.new
    todo_elem.name = user_name
    todo_elem.status = 0
    todo_elem.msg = URI.encode(msg_in)
    todo_elem.save;
    
    todo_elem = TodoTable.find_by_id(todo_elem.id);

    after_counts = getCounts(user_name)

    # 新規レコードを送信
    print todo_elem.id.to_s + "!" + getTodoHtml( todo_elem.id, URI.decode(todo_elem.msg), 0, todo_elem.attributes_before_type_cast["updated_at"], true ) + "!" + after_counts.join(",")

  # 更新モードの場合
  when /update/ 
    target_todo = TodoTable.find_by_id(id_in);
    if target_todo != nil
      # doing -> done doing -> doing の場合だけ doing_at は更新しない
      doing_at_update = true
      if status_in.to_i == 3 and target_todo.status == 2
        doing_at_update = false
      elsif status_in.to_i == 2 and target_todo.status == 2
        doing_at_update = false
      end

      target_todo.update_attributes(:status => status_in.to_i,
                                    :msg    => URI.encode(msg_in));

      if doing_at_update
        target_todo.update_attributes(:doing_at => target_todo.updated_at)
      end

      after_counts = getCounts(user_name)

      # 更新結果を送信
      print "#{target_todo.id},#{target_todo.status},#{target_todo.msg},#{target_todo.attributes_before_type_cast["updated_at"]},#{after_counts.join(",")}";
    else
      print "Error: no update id. #{id_in} #{status_in} #{msg_in}";
    end

  # Todo取得モードの場合
  when /gettodo/
    one_todo = TodoTable.find_by_id(id_in);
    if one_todo != nil
      print "#{one_todo.id},#{one_todo.status},#{one_todo.msg},#{one_todo.attributes_before_type_cast["updated_at"]}";
    else
      # 該当データなし
      print "0,0,";
    end

  # １件削除モードの場合
  when /delete/
    one_todo = TodoTable.find_by_id(id_in);
    if one_todo != nil
      one_todo.destroy;
      after_counts = getCounts(user_name)
      print "#{one_todo.id},#{after_counts.join(",")}" ;
    else
      # 該当データなし
      after_counts = getCounts(user_name)
      print "none,#{after_counts.join(",")}" ;
    end

  # 全削除モードの場合
  when /alldelete/
    all_todos = TodoTable.find(:all);
    all_todos.each{ | todo |
      todo.destroy;
    }

  # ユーザページ表示
  when /user/
    showFirstPage(user_name,filter)

  # Doneリストページ表示
  when /done/
    showDoneListPage(user_name)

  # 新規ユーザ追加 & ページ表示
  when /new/
    if user_name != ""
      addUser(user_name, nil)
      showFirstPage(user_name,filter)
    else
      showSelectPage()
    end

  when /getcount/
    counts = getCounts(user_name)
    puts counts

  # 背景画像URL設定要求
  when /setbgurl/
    setBgImg(user_name, bg_url)

  when /setlayout/
    setLayout(user_name, layout)

  when /alldoing/
    showAllDoingPage()

  when /filter/
    showFilterPage(user_name,filter)

  when /pomo/
    aready_user = TodoUser.find(:all, :conditions => ["name = ?", user_name ])
    if aready_user.length == 0 
      return 
    end

    aready_user[0].pomo = aready_user[0].pomo + 1 
    aready_user[0].save

  else 
    # 初期ページ表示
    showSelectPage()
  end
end

def addUser( new_name ,passwd )
  # 既に登録済みか確認する
  aready_user = TodoUser.find(:all, :conditions => ["name = ?", new_name ])
  if aready_user.length != 0
    return
  end

  # 新規ユーザレコードを追加
  todo_user = TodoUser.new
  todo_user.name = new_name
  todo_user.pass = passwd
  todo_user.layout = 2
  todo_user.save;

end

def setBgImg( name ,bg_url )
  # 既に登録済みか確認する
  aready_user = TodoUser.find(:all, :conditions => ["name = ?", name ])
  if aready_user.length == 0
    puts "Error: unknown user name"
    return
  end

  #背景URLを登録
  aready_user[0].update_attributes(:bg_img_url => bg_url);
  puts "OK: changed bg image to #{bg_url}"
end

def setLayout( name ,layout )
  # 既に登録済みか確認する
  aready_user = TodoUser.find(:all, :conditions => ["name = ?", name ])
  if aready_user.length == 0
    puts "Error: unknown user name"
    return
  end

  #レイアウトを登録
  aready_user[0].update_attributes(:layout => layout);
  puts "OK: changed layout to #{layout}"
end

def showSelectPage
  # テンプレートファイルを読み込む
  index_temp = "";
  f = open("./tmpl/select_index.tmpl"){ | template |
    index_temp = template.read.toutf8
  }

  index_temp.gsub!("FOOTER_HTML", getFooterHtml(nil) );
  index_temp.gsub!("URL_NAME",URL_NAME)
  index_temp.gsub!("BACKGROUND_IMG_URL",getBgImgFromName(""))

  # ユーザ選択フォームの作成
  all_users = TodoUser.find(:all, :order => 'name')

  options = []
  all_users.each{|user| options.push("<option value=\"#{user.name}\">#{user.name}")}

  index_temp.gsub!("USER_OPTIONS",options.join("\n"))
  index_temp.gsub!("INFO_MSG", getInfoMsg());


  # html をクライアントに送信する
  print index_temp
end

def getFooterHtml(name)
  footer_tmpl = "";
  f = open("./tmpl/footer.tmpl"){ | template |
    footer_tmpl = template.read.toutf8
  }

  # ユーザ選択フォームの作成
  all_users = TodoUser.find(:all, :order => 'name')
 
  options = []
  all_users.each{|user| options.push("<option value=\"#{user.name}\">#{user.name}")}

  footer_tmpl.gsub!("USER_OPTIONS",options.join("\n"))

  # 背景選択フォームの作成
  if name == nil then name = ""; end
  bg_img_name = getBgImgFromName(name)

  options = []
  bg_imgs = Dir::entries(BASE_BG_PATH)
  bg_imgs.sort.each{|img| 
    if /^\.+/ =~ img
    
    else 
      if bg_img_name == ( BASE_BG_PATH + img )
        options.push("<option value=\"#{img}\" selected>#{img}")
      else
        options.push("<option value=\"#{img}\">#{img}")
      end
    end
  }

  footer_tmpl.gsub!("BGIMG_OPTIONS",options.join("\n"))

  return footer_tmpl
end

def getCounts(name)
  all_todos_counts = []

  # Todo を読み込む
  (0..5).each{|i|
    todo_elems = []
    if name != nil
      todo_elems = TodoTable.find(:all, :conditions => ["status = ? and name = ?", i,name ]);
    end
    all_todos_counts[i] = todo_elems.size
  }

  return all_todos_counts
end

def getBgImgFromName(name)
  # ユーザテーブルから背景画像URLを取得
  user_info = TodoUser.find(:all, :conditions => ["name = ?", name ])
  
  if user_info.length == 0
    return BASE_BG_PATH + DEFAULT_BG_IMG_URL
  end

  bg_img_url = user_info[0].bg_img_url
  if bg_img_url.sub(/ .$/,"") == ""
    bg_img_url = DEFAULT_BG_IMG_URL # デフォルト背景
  end
  return BASE_BG_PATH + bg_img_url  
end

def getLayoutFromName(name)
  # ユーザテーブルからレイアウトURLを取得
  user_info = TodoUser.find(:all, :conditions => ["name = ?", name ])

  if user_info.length == 0
    return ""
  end

  layout_no = user_info[0].layout
  layout_file = "#{BASE_LAYOUT_PATH}task_list_#{layout_no}.tmpl"

  return layout_file
end

def showFilterPage(name,filter)
  print getFilteredTaskList(name, filter)
end

def getFilteredTaskList(name, filter)
  tmpl_file = getLayoutFromName(name)

  task_list_tmpl = "";
  f = open(tmpl_file){ | template |
    task_list_tmpl = template.read.toutf8
  }

  all_todos = nil
  # Todo を読み込む
  if name != nil
    all_todos = TodoTable.find(:all, :conditions => ["name = ? and msg LIKE ?", name ,"%#{URI.encode(filter)}%"], :order => 'updated_at DESC');
  end

  # status によって li 要素を生成する
  doing_li_ar = []
  waiting_li_ar = []
  todo_li_ar = []
  todo_low_li_ar = []
  todo_high_li_ar = []
  done_li_ar = []

  done_num = 0
  all_todos.each {|one_todo|
    case one_todo.status
      when 0 # todo
        todo_li_ar.push( getTodoHtml( one_todo.id, URI.decode(one_todo.msg), 0, one_todo.attributes_before_type_cast["updated_at"] ))
      when 1 # wait
        waiting_li_ar.push( getTodoHtml( one_todo.id, URI.decode(one_todo.msg), 0, one_todo.attributes_before_type_cast["updated_at"] ))
      when 2 # doing
        doing_li_ar.push( getTodoHtml( one_todo.id, URI.decode(one_todo.msg), 0, one_todo.attributes_before_type_cast["updated_at"] ))
      when 3 # done
        done_num = done_num + 1
        next if done_num > DONE_LIMIT
        done_li_ar.push( getTodoHtml( one_todo.id, URI.decode(one_todo.msg), 2, one_todo.attributes_before_type_cast["updated_at"] ))
      when 4 # todo_l
        todo_low_li_ar.push( getTodoHtml( one_todo.id, URI.decode(one_todo.msg), 0, one_todo.attributes_before_type_cast["updated_at"] ))
      when 5 # todo_h
        todo_high_li_ar.push( getTodoHtml( one_todo.id, URI.decode(one_todo.msg), 0, one_todo.attributes_before_type_cast["updated_at"] ))
    end
  }

  # li 要素を html に反映する
  task_list_tmpl.gsub!("DOING_LI_PLACE",     doing_li_ar.join("\n"))
  task_list_tmpl.gsub!("WAITING_LI_PLACE",   waiting_li_ar.join("\n"))
  task_list_tmpl.gsub!("DONE_LI_PLACE",      done_li_ar.join("\n"))
  task_list_tmpl.gsub!("TODO_LI_PLACE",      todo_li_ar.join("\n"))
  task_list_tmpl.gsub!("TODO_LOW_LI_PLACE",  todo_low_li_ar.join("\n"))
  task_list_tmpl.gsub!("TODO_HIGH_LI_PLACE", todo_high_li_ar.join("\n"))
  task_list_tmpl.gsub!("RECENT_NUM", DONE_LIMIT.to_s)
  task_list_tmpl.gsub!("URL_NAME",URL_NAME)
  task_list_tmpl.gsub!("USER_NAME", name); 

  return task_list_tmpl

end

def showFirstPage(name,filter)
  # テンプレートファイルを読み込む
  index_tmpl = "";
  f = open("./tmpl/todo_index.tmpl"){ | template |
    index_tmpl = template.read.toutf8
  }

  index_tmpl.gsub!("TASK_LIST_HTML", getFilteredTaskList(name, ""))

  todo_nums = getCounts( name )
  # 要素数を html に反映する
  index_tmpl.gsub!("DOING_NUM",     todo_nums[2].to_s)
  index_tmpl.gsub!("TODO_H_NUM",    todo_nums[5].to_s)
  index_tmpl.gsub!("TODO_NUM",      todo_nums[0].to_s)
  index_tmpl.gsub!("TODO_L_NUM",    todo_nums[4].to_s)
  index_tmpl.gsub!("WAITING_NUM",   todo_nums[1].to_s)
  index_tmpl.gsub!("DONE_NUM",      todo_nums[3].to_s)

  # それ以外を html に反映する
  index_tmpl.gsub!("FOOTER_HTML", getFooterHtml(name) );
  index_tmpl.gsub!("PAGE_TITLE", PAGE_TITLE.to_s)
  index_tmpl.gsub!("RECENT_NUM", DONE_LIMIT.to_s)
  index_tmpl.gsub!("URL_NAME",URL_NAME)
  index_tmpl.gsub!("BACKGROUND_IMG_URL",getBgImgFromName(name))
  index_tmpl.gsub!("USER_NAME", name); 
  index_tmpl.gsub!("INFO_MSG", getInfoMsg()); 


  # html をクライアントに送信する
  print index_tmpl
end

def getInfoMsg()
  # 更新情報を読み込む
  info_msg = [];
  f = open("./info_message.txt"){ | info |
    while line = info.gets
      info_msg.push("<li>" + line + "</li>")
    end
  }
  return info_msg.join("\n")
end

def showDoneListPage(name)
  # テンプレートファイルを読み込む
  index_tmpl = "";
  f = open("./tmpl/todo_donelist.tmpl"){ | template |
    index_tmpl = template.read.toutf8
  }

  all_todos = nil
  # Todo を読み込む
  if name != nil
    done_todos = TodoTable.find(:all, :conditions => ["status = 3 and name = ?", name ], :order => 'updated_at DESC' );
  else
    done_todos = TodoTable.find(:all, :conditions => "status = 3", :order => 'updated_at DESC' );
    name = "";
  end

  todo_nums = getCounts(name)
  day_num = 0
  # done の場合は最新の上位を返す
  #TODO: ここのループはひどい。リファクタリング対象。月データをクラス化すればすっきりしそう
  #TODO: やりたいことは、Done要素を月別にまとめて合計値を管理したい 
  if done_todos != nil
    date_cmp_str = ""
    in_date_flg = false;
    done_li_tmp_ar = []
    
    mon_cmp_str = ""
    mon_li_ha = Hash.new
    mon_num_ha = Hash.new

    in_date_flg = false;
    done_todos.each{|one_todo|
      current_date_str = one_todo.attributes_before_type_cast["updated_at"].to_s.split(" ")[0]
      if current_date_str == nil
        current_date_str = "0000-00-00"
      end
      current_mon_str = current_date_str.split("-")[0].to_s + "-" + current_date_str.split("-")[1].to_s

      # 一発目は無条件でハッシュを生成。以降は月が変わったらハッシュ生成
      if mon_cmp_str == ""
        mon_cmp_str = current_mon_str
        mon_li_ha[current_mon_str] = Array.new
        mon_num_ha[current_mon_str] = 0
      elsif mon_cmp_str != current_mon_str 
        mon_li_ha[current_mon_str] = Array.new
        mon_num_ha[current_mon_str] = 0
      end

      if date_cmp_str != current_date_str
        day_num += 1
        if in_date_flg == false
          in_date_flg = true
          done_li_tmp_ar = []
          done_li_tmp_ar.push( getDoneHtml( one_todo.id, URI.decode(one_todo.msg), one_todo.attributes_before_type_cast["updated_at"] ))
        else
          mon_li_ha[mon_cmp_str].push( getDoneDayLiHtml(date_cmp_str, done_li_tmp_ar.size ) + done_li_tmp_ar.join("\n") + "</ul></div></li>\n" )
          mon_num_ha[mon_cmp_str] += done_li_tmp_ar.size
          if mon_cmp_str != current_mon_str
            mon_cmp_str = current_mon_str
          end
          done_li_tmp_ar = []
          done_li_tmp_ar.push( getDoneHtml( one_todo.id, URI.decode(one_todo.msg), one_todo.attributes_before_type_cast["updated_at"] ))
        end
        date_cmp_str = current_date_str
      else
        done_li_tmp_ar.push( getDoneHtml( one_todo.id, URI.decode(one_todo.msg), one_todo.attributes_before_type_cast["updated_at"] ))
      end
    }
    mon_li_ha[mon_cmp_str].push( getDoneDayLiHtml(date_cmp_str, done_li_tmp_ar.size ) + done_li_tmp_ar.join("\n") + "</ul></div></li>\n" )
    mon_num_ha[mon_cmp_str] += done_li_tmp_ar.size
  end

  done_list_html = ""
  mon_li_ha.sort{|a, b| b[0] <=> a[0]}.each do|key, value|
    done_list_html += getDoneMonLiHtml(key, value, mon_num_ha[key])
  end

  # li 要素を html に反映する
  index_tmpl.gsub!("DONE_LI_PLACE",      done_list_html)

  # 要素数を html に反映する
  index_tmpl.gsub!("DOING_NUM",     todo_nums[2].to_s)
  index_tmpl.gsub!("TODO_H_NUM",    todo_nums[5].to_s)
  index_tmpl.gsub!("TODO_NUM",      todo_nums[0].to_s)
  index_tmpl.gsub!("TODO_L_NUM",    todo_nums[4].to_s)
  index_tmpl.gsub!("WAITING_NUM",   todo_nums[1].to_s)
  index_tmpl.gsub!("DONE_NUM",      todo_nums[3].to_s)

  # それ以外を html に反映する
  index_tmpl.gsub!("FOOTER_HTML", getFooterHtml(name) );
  index_tmpl.gsub!("RECENT_NUM", DONE_LIMIT.to_s)
  index_tmpl.gsub!("USER_NAME", name);
  index_tmpl.gsub!("URL_NAME",URL_NAME)
  index_tmpl.gsub!("BACKGROUND_IMG_URL",getBgImgFromName(name))
  index_tmpl.gsub!("AVE_NUM",format("%.1f",(done_todos.size.to_f / day_num.to_f)))
  index_tmpl.gsub!("DAYS_NUM",day_num.to_s)

  # html をクライアントに送信する
  print index_tmpl
end

def getDoneDayLiHtml(date_str, num)
  graph_str = "+" * num
  day_str = date_str.split("-")[1] + "/" + date_str.split("-")[2]
 
  return "<li><font color=\"#00008B\"><b>#{day_str}</b> </font><button class=\"each_day_list\" style=\"width : 40px;\" onclick=\"$('##{date_str}_list').slideToggle('normal');\"><b>#{num}</b></button>#{graph_str}<div id=\"#{date_str}_list\" style=\"display:none\"><ul>\n"
end

def getDoneMonLiHtml(date_str, day_li, num)
  graph_str = "|" * num
  return "<li><font color=\"#00008B\"><b>[#{date_str}] </b></font><button class=\"each_mon_list\" style=\"width : 40px;\" onclick=\"$('##{date_str}_mon_list').slideToggle('normal');\"><b>#{num}</b></button>#{graph_str}<div id=\"#{date_str}_mon_list\" style=\"display:none\"><ul>#{day_li}</ul>\n"

end

def showAllDoingPage()
  # テンプレートファイルを読み込む
  index_temp = "";
  f = open("./tmpl/todo_alldoing.tmpl"){ | template |
    index_temp = template.read.toutf8
  } 

  # 全ユーザの Doing リストを作成    
  all_users = TodoUser.find(:all, :order => 'name')

  doing_lists = []
  graph_inputs = []
  name_list = []
  all_users.each{|user| 
    is_ignore = false
    ALLDOING_IGNORE_USERS.each{ |ignore_name|
      if user.name == ignore_name then is_ignore = true end
    }
    next if is_ignore 

    # グラフの引数を生成する
    todo_nums = getCounts(user.name)
    graph_inputs.push( user.name + "," + todo_nums.join(",") )
    name_list.push( "<li><a href=\"#" + user.name + "\">" + user.name + "</a></li>")
    doing_lists.push(getDoingList(user.name, BASE_BG_PATH + user.bg_img_url ))
  }

  index_temp.gsub!("ALLDOING_LIST_PLACE",doing_lists.join)
  index_temp.gsub!("ALLDOING_NAME_PLACE",name_list.join)

  # Footer を設定する
  index_temp.gsub!("FOOTER_HTML", getFooterHtml(nil) );
  index_temp.gsub!("URL_NAME",URL_NAME)
  index_temp.gsub!("BACKGROUND_IMG_URL",getBgImgFromName(""))

  # html をクライアントに送信する
  print index_temp

end

# li 要素を生成するメソッド
def getTodoHtml( id_num, msg, active_no, update_time , first_hide = false)
  disp_str = ["none","none","none"]
  disp_li_str = "block"
  disp_str[active_no] = "block";
  
  disp_li_str = "none" if first_hide == true

  id = id_num.to_s

  if update_time == nil
    update_time = "0000-00-00 0 "
  end
 
  show_time = "#{update_time.split(" ")[0].split("-")[1]}/#{update_time.split(" ")[0].split("-")[2]}"

html ='<li id="id_' + id + '" class="task_elem" style="display:' + disp_li_str + '">
  <div class="sorttime" alt="' + update_time + '" id="ms_notyet_' + id + '">
    <div class="citem_editable">
      <div id="edit_link_ms_' + id + '" style="display:' + disp_str[0] + '">
        <table cellpadding=0 cellpadding=0 hspace=0 vspace=0 width="100%"><tr><td align="left" width="20px">
        <input type="checkbox" onclick="moveToDone(\'#id_' + id + '\');return false;"/>
        </td><td class="taskLabel" align="left">
        <font color="#00008B" style="font-size:10px;font-weight:normal;" ><div id="edit_link_time_' + id + '" style="display:inline;">[' + show_time + ']</div></font>&nbsp;
        <div id="msg_' + id + '" style="display:inline;">' + msg + '</div>&nbsp;
        </td><td align="right" width="40px">
        <div id="ms_' + id + '_menu" style="display:inline;">
          <span class="s12">
            <input type="image" src="images/pencil.gif" OnMouseOver="$(this).get(0).src = \'images/pencil_over.gif\'" OnMouseOut="$(this).get(0).src = \'images/pencil.gif\'" onclick="$(\'#id_' + id + '\').parent().sortable(\'destroy\');$(\'#ms_' + id + '_edit\').text($(\'#msg_' + id + '\').html());toggleDisplay(\'edit_link_ms_' + id + '\',\'edit_form_ms_' + id + '\');$(\'#ms_' + id + '_edit\').get(0).focus();return false;"/>
            <input type="image" src="images/cross.gif" OnMouseOver="$(this).get(0).src = \'images/cross_over.gif\'" OnMouseOut="$(this).get(0).src = \'images/cross.gif\'" onclick="deleteTodo(\'#id_' + id + '\');return false;"/>
          </span>
        </div>
        </td></tr></table>
      </div>
      <div id="edit_form_ms_' + id + '" style="display:' + disp_str[1] + '">
        <form method="post" style="display:inline" onsubmit="$(\'#id_' + id + '\').parent().sortable(option);updateToDoMsg(\'#ms_' + id + '_edit\', \'#msg_' + id + '\');toggleDisplay(\'edit_form_ms_' + id + '\',\'edit_link_ms_' + id + '\');return false;">
        <textarea id="ms_' + id + '_edit" name="ttl" cols=80 rows=4 style="font-weight:normal;padding:2px;overflow:auto" onfocus="this.style.background=\'#ffc\';"/></textarea>
          <input type="submit" value="Update" style="font-size:10px" />
          <span class="s12">
            <a href="#" onclick="$(\'#id_' + id + '\').parent().sortable(option);toggleDisplay(\'edit_form_ms_' + id + '\',\'edit_link_ms_' + id + '\');return false;">[cancel]</a>
          </span>
        </form>
      </div>
      <div id="fixed_' + id + '" style="display:' + disp_str[2] + '">
        <table width="100%"><tr><td align="left">
          <font color="#00008B"><div id="fixed_time_' + id + '" style="display:inline;">[' + show_time + ']</div></font>&nbsp;
          <div id="fixed_msg_' + id + '" style="display:inline;">' + msg + '</div>
        </td><td align="right" width="40px">
          <a href="#" onclick="returnToTodo(\'#id_' + id + '\');return false;">&nbsp;[<]</a>
          <a href="#" onclick="deleteTodo(\'#id_' + id + '\');return false;">&nbsp;[x]</a>
        </td></tr></table>
      </div>
    </div>
  </div>
</li>';

  return html
end

# Doneリストの要素を生成するメソッド
def getDoneHtml( id_num, msg, update_time )

  id = id_num.to_s

  if update_time == nil
    update_time = "0000-00-00 00:00:00 "
  end

  update_detail_time = "#{update_time.split(" ")[1].split(":")[0]}:#{update_time.split(" ")[1].split(":")[1]}"

html ='<li id="id_' + id + '" class="task_elem" style="display:block">
  <div class="sorttime" alt="' + update_time + '" id="ms_notyet_' + id + '">
      <div id="fixed_' + id + '" style="display:block">
        <table width="100%"><tr><td align="left" width="40px">
          <font color="#777777"><div id="fixed_time_' + id + '" style="display:inline;">' + update_detail_time + '</div></font>&nbsp;
        </td><td align="left">
          <div id="fixed_msg_' + id + '" style="display:inline;">' + msg + '</div> 
        </td><td align="right">
          <a href="#" onclick="deleteTodo(\'#id_' + id + '\');return false;">&nbsp;[x]</a>
        </td></tr></table>
      </div>
  </div>
</li>';

  return html
end

# AllDoing リストで表示する Done 要素
def getAllDoneHtml( id_num, msg, update_time )

  id = id_num.to_s

  if update_time == nil
    update_time = "0000-00-00 00:00:00 "
  end

  update_detail_time = "#{update_time.split(" ")[1].split(":")[0]}:#{update_time.split(" ")[1].split(":")[1]}"

html ='<li id="id_' + id + '" class="task_elem" style="display:block">
  <div class="sorttime" alt="' + update_time + '" id="ms_notyet_' + id + '">
      <div id="fixed_' + id + '" style="display:block">
        <table cellpadding=0 cellpadding=0 hspace=0 vspace=0 ><tr><td>
        <font color="#44444444"><div id="fixed_time_' + id + '" style="display:inline;">[' + update_detail_time + ']</div></font>&nbsp;
        </td><td>
        <div id="fixed_msg_' + id + '" style="display:inline;">' + msg + '</div>
        </td></tr></table>
      </div>
  </div>
</li>';

  return html
end

def getAllDoingHtml( id_num, msg, update_time )

  id = id_num.to_s

  if update_time == nil
    update_time = "0000-00-00 00:00:00 "
  end

  update_detail_time = "#{update_time.split(" ")[0]} #{update_time.split(" ")[1].split(":")[0]}:#{update_time.split(" ")[1].split(":")[1]}"

html ='<li id="id_' + id + '" style="display:block">
  <div class="sorttime" alt="' + update_time + '" id="ms_notyet_' + id + '">
      <div id="fixed_' + id + '" style="display:block">
        <table><tr><td>
        <input type="checkbox" disabled/>
        </td><td>
        <font color="#444400" style="font-size:11px;font-weight:normal;"><div id="fixed_time_' + id + '" style="display:inline;">[' + update_detail_time + ']</div></font>&nbsp;
        <div id="fixed_msg_' + id + '" style="display:inline;">' + msg + '</div>
        </td></tr></table>
      </div>
  </div>
</li>';

  return html
end

def getDoingList( name , bg_img )
  todo_counts = '
<table id="table-02" width="400">
<tr>
<th class="doing"   width="16%" >Doing</th>
<th class="todo_h"  width="16%">Todo(H)</th>
<th class="todo"    width="16%">Todo</th>
<th class="todo_l"  width="16%">Todo(L)</th>
<th class="waiting" width="16%">Waiting</th>
<th class="done"    width="16%">Done</th>
</tr>
<tr>
<td id="doing_num"  >DOING_NUM</td>
<td id="todo_h_num" >TODO_H_NUM</td>
<td id="todo_num"   >TODO_NUM</td>
<td id="todo_l_num" >TODO_L_NUM</td>
<td id="waiting_num">WAITING_NUM</td>
<td id="done_num"   >DONE_NUM</td>
</tr>
</table>'

  todo_nums = getCounts( name )
  # 要素数を html に反映する
  todo_counts.gsub!("DOING_NUM",     todo_nums[2].to_s)
  todo_counts.gsub!("TODO_H_NUM",    todo_nums[5].to_s)
  todo_counts.gsub!("TODO_NUM",      todo_nums[0].to_s)
  todo_counts.gsub!("TODO_L_NUM",    todo_nums[4].to_s)
  todo_counts.gsub!("WAITING_NUM",   todo_nums[1].to_s)
  todo_counts.gsub!("DONE_NUM",      todo_nums[3].to_s)

  # Doing 要素を検索
  doing_todos = TodoTable.find(:all, :conditions => ["status = 2 and name = ?", name ], :order => 'updated_at DESC' );

  doing_li_ar = []
  doing_todos.each {|one_todo|
    doing_li_ar.push( getAllDoingHtml( one_todo.id, URI.decode(one_todo.msg), one_todo.attributes_before_type_cast["updated_at"] ))
  }

  # 本日の Done 要素を検索
  now_date_str = Time.now.strftime("%Y-%m-%d")
  done_todos = TodoTable.find(:all, :conditions => ["status = 3 and name = ? and updated_at LIKE ?", name, "#{now_date_str}%" ], :order => 'updated_at DESC' );

  done_li_ar = []
  done_todos.each {|one_todo|
    done_li_ar.push( getAllDoneHtml( one_todo.id, URI.decode(one_todo.msg), one_todo.attributes_before_type_cast["updated_at"] ))
  }

  done_ul = ""
  if done_li_ar.length > 0
    done_ul = '<ul class="donelist">' + done_li_ar.join("\n") + '</ul>'
  end

  doing_list = '
<div>
  <a name="' + name + '">
<div class="memitem">
<a href="' + URL_NAME + '/todo.cgi?mode=user&name=' + name + '">
<div class="memproto">
<div class="memname_doing"><center>' + name + '</center></div>
</div>
</a>
<div class="memdoc_doing">
  <table width="100%" border="0">
    <tr><td valign="top" width="20%">
    ' + todo_counts + '
    </td><td valign="top" >
      <ul class="doinglist">' + "\n" + doing_li_ar.join("\n") + '</ul>
      ' + done_ul + '
    </td></tr>
  </table>
</div>
</div>
</div>'

  return doing_list 
end

##### main start ############
main()
#############################


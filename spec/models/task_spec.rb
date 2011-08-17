require 'spec_helper'

describe Task do
  fixtures :tasks, :users

  describe "初期設定されているタスクを読み出す場合" do
    it "全て読み出すことができる" do
      Task.find(:all).should_not be_nil
      Task.find(:all).size.should >= 1
    end
  end

  describe "特定ユーザと状態を指定してタスクを取り出す場合" do
    before do
      user = User.by_name("volpe")
      @tasks = user.tasks.by_status(:todo_m)
    end
    subject{@tasks}

    it "タスクを取得すること" do
      subject.size.should >= 1
    end

    it "タスクが指定した名前である" do
      subject.each{|t|
        t.name.should == "volpe"
      }
    end

    it "タスクが指定した状態である" do
      subject.each{|t|
        t.status_sym.should == :todo_m
      }
    end
  end

  describe "フィルタを指定してタスクを取り出す場合" do
    before do
      @tasks = Task.filterd("volpe", "italia")
    end
    subject{@tasks}

    it "タスクを取得すること" do
      subject.size.should >= 1
    end

    it "メッセージにフィルタ文字が含まれる" do
      subject.each{|t|
        t.msg.should =~ /italia/
      }
    end
  end

  describe "Doneと名前を指定してタスクを取り出す場合" do
    before do
      @tasks = Task.done_by_name("volpe")
    end
    subject{@tasks}

    it "タスクを取得すること" do
      subject.size.should >= 1
    end

    it "指定ユーザ名のタスクである" do
      subject.each{|t|
        t.name.should == "volpe"
      }
    end

    it "done のタスクである" do
      subject.each{|t|
        t.status_sym.should == :done
      }
    end
  end

  describe "Doneを指定してタスクを取り出す場合" do
    before do
      @tasks = Task.done
    end
    subject{@tasks}

    it "タスクを取得すること" do
      subject.size.should >= 1
    end

    it "done のタスクである" do
      subject.each{|t|
        t.status_sym.should == :done
      }
    end
  end

  describe "Doingと名前を指定してタスクを取り出す場合" do
    before do
      @tasks = Task.doing_by_name("volpe")
    end
    subject{@tasks}

    it "タスクを取得すること" do
      subject.size.should >= 1
    end

    it "指定ユーザ名のタスクである" do
      subject.each{|t|
        t.name.should == "volpe"
      }
    end

    it "doing のタスクである" do
      subject.each{|t|
        t.status_sym.should == :doing
      }
    end
  end

  describe "本日のDoneと名前を指定してタスクを取り出す場合" do
    before do
      @task = Task.today_done_by_name("volpe")
    end
    subject{@task}

    it "タスクを取得すること" do
      subject.size.should >= 1
    end

    it "doneのタスクである" do
      subject.each{|t|
        t.status_sym.should == :done
      }
    end
  end

  describe "各状態のタスク数を取り出す場合" do
    before do
      @task_counts = Task.all_counts_by_name("volpe")
    end
    subject{@task_counts}

    it "タスク数が正しいこと" do
      subject[:todo_h].should >= 1
      subject[:todo_m].should >= 1
      subject[:todo_l].should >= 1
      subject[:doing].should >= 1
      subject[:waiting].should >= 1
      subject[:done].should >= 2
    end
  end

  describe "ステータスを更新する場合" do
    before do
      task = Task.find(6)
      task.update_status("todo_m")
      task.save
    end

    it "ステータスが数値で格納されること" do
      Task.find(6).status.should == StatusTable[:todo_m]
    end
  end

end

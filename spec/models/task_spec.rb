require 'spec_helper'

describe Task do
  fixtures :tasks

  describe "初期設定されているタスクを読み出す場合" do
    it "全て読み出すことができる" do
      Task.find(:all).should_not be_nil
      Task.find(:all).size.should >= 1
    end
  end

  describe "名前と状態を指定してタスクを取り出す場合" do
    before do
      @tasks = Task.by_name_and_status("volpe",:todo_m)
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

  describe "Doneを指定してタスクを取り出す場合" do
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
end

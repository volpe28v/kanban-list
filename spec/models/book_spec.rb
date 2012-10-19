# coding: utf-8
require 'spec_helper'

describe Book do
  before do
    @book = Factory.create(:work_book)
  end
  subject{@book}

  describe "defaultのBook名を取得" do
    it "期待したBook名である" do
      Book.default_name.should == "All Tasks"
    end
  end

  describe "Book から特定の状態のタスク数を取り出す場合" do

    it "todo_h タスク数を取得すること" do
      subject.todo_h_count.should >= 1
    end

    it "todo_m タスク数を取得すること" do
      subject.todo_m_count.should >= 1
    end

    it "todo_l タスク数を取得すること" do
      subject.todo_l_count.should >= 1
    end

    it "doing タスク数を取得すること" do
      subject.doing_count.should >= 1
    end

    it "waitingタスク数を取得すること" do
      subject.waiting_count.should >= 1
    end

    it "doneタスク数を取得すること" do
      subject.done_count.should >= 1
    end
  end

  describe "タスク数のまとめ情報を取得する場合" do
    it "タスクの個別数が格納されている" do
      subject.task_count_info[:todo_h].should >= 1
      subject.task_count_info[:done].should >= 1
    end

    it "アクティブなタスク数が格納されている" do
      subject.task_count_info['active_task'] >= 1
    end

    it "bookのIDが格納されている" do
      subject.task_count_info['id'].should == subject.id
    end

    it "bookの名前が格納されている" do
      subject.task_count_info['name'].should == subject.name
    end
  end
end

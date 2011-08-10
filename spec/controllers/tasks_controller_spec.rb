require 'spec_helper'

describe TasksController do
  fixtures :users,:tasks


  describe "GET 'index'" do
    it "should be successful" do
      get 'index'
      response.should be_success
    end
  end

  describe "get tasks" do
    before do
      post :user,{ :user => "baggio" }
    end

    it "レスポンスが正常であること" do
      response.should be_success
    end

    it 'タスク一覧画面を表示すること' do
      response.should render_template("task/index")
    end

    it 'user をセッションスコープに保存すること' do
      session[:user].should == Task.by_name("baggio").id
    end
  end

  describe "POST 'update'" do
    before do
      post :update,{ :id => "6" , :status => "doing" }
    end

    it "レスポンスが正常であること" do
      response.should be_success
    end

    it "状態を更新すること" do
      Task.find(6).status.should == 3
    end

    it "メッセージを更新すること" do
      Task.find(6).msg.should == "updated"
    end
  end

end

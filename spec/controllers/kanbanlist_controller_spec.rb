require 'spec_helper'

describe KanbanlistController do
  fixtures :users,:tasks

  describe "GET 'index'" do
    it "レスポンスが正常であること" do
      get :index
      response.should be_success
    end

    it '初期画面を表示すること' do
      get :index
      response.should render_template("kanbanlist/index")
    end
  end

  describe "POST 'user'" do
    before do
      post :user,{ :user => "baggio" }
    end

    it "レスポンスが正常であること" do
      response.should be_success
    end

    it 'タスク一覧画面を表示すること' do
      response.should render_template("kanbanlist/user")
    end

    it 'user をセッションスコープに保存すること' do
      session[:user].should == "baggio"
    end
  end

  describe "POST 'update'" do
    before do
      post :update,{ :id => "6" ,:msg => "updated", :status => "doing" }
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

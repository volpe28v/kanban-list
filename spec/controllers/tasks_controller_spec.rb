require 'spec_helper'

describe TasksController do
  fixtures :users,:tasks

  describe "GET 'index'" do
    it "レスポンスが正常であること" do
      sign_in User.first
      get 'index'
      response.should be_success
    end
  end

  describe "get tasks" do
    before do
      sign_in User.first
      get :index,{ :user => "baggio" }
    end

    it "レスポンスが正常であること" do
      response.should be_success
    end

    it 'タスク一覧画面を表示すること' do
      response.should render_template("layouts/application", "tasks/index")
    end

  end

  describe "POST 'update'" do
    before do
      sign_in User.first
      post :update,{ :id => "6" , :status => "doing", :msg => "updated" }
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

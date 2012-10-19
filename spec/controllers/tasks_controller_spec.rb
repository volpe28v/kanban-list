# coding: utf-8
require 'spec_helper'

describe TasksController do

  describe "GET 'index'" do
    it "レスポンスが正常であること" do
      sign_in User.find_by_name("volpe") || Factory.create(:volpe)
      get 'index'
      response.should be_success
    end
  end

  describe "get tasks" do
    before do
      sign_in User.find_by_name("volpe") || Factory.create(:volpe)
      get :index,{ :user => "volpe" }
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
      sign_in User.find_by_name("volpe") || Factory.create(:volpe)
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

  describe "task destroy" do
    before do
      sign_in User.find_by_name("volpe") || Factory.create(:volpe)
      delete :destroy,{ :id => "1" }
    end

    it "レスポンスが正常であること" do
      response.should be_success
    end

    it "タスクが削除されること" do
      Task.exists?(1).should be_false
    end
  end

  describe "task filter_or_filter" do
    before do
      sign_in User.find_by_name("volpe") || Factory.create(:volpe)
      post :filter_or_update,{ :filter => "todo_m" }
    end

    it "レスポンスが正常であること" do
      response.should be_success
    end
  end
end

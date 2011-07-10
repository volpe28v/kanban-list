require 'spec_helper'

describe KanbanlistController do

  describe "GET 'index'" do
    it "レスポンスが正常であること" do
      get :index
      response.should be_success
    end

    it '初期画面を表示すること' do
      get :index
      response.should render_template("kanbanlist/index")
    end

    it 'ユーザ情報を読み出すこと' do
      User.should_receive(:all_user)
      get :index
    end
  end

  describe "POST 'new_user'" do
    before do
      post :new_user,{ :user => "messi" }
    end

    it 'リダイレクトすること' do
      response.should be_redirect
    end

    it 'タスク一覧画面を表示すること' do
      response.should redirect_to(:action => 'user', :user => "messi")
    end

    it '新規ユーザが登録されること' do
      User.find_by_name("messi").should_not be_nil
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
  end
end

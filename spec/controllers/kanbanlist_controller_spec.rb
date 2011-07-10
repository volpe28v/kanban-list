require 'spec_helper'

describe KanbanlistController do

  describe "GET 'index'" do
    it "should be successful" do
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

end

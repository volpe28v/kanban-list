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

end

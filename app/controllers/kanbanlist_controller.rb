class KanbanlistController < ApplicationController
  def index
    @all_user = User.all_user
  end

  def new_user
    User.add_user(params[:user])
    redirect_to :action => "user",:user => params[:user]
  end

  def user
    @user_name = params[:user]
  end

end

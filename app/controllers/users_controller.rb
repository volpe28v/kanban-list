class UsersController < ApplicationController
  before_filter :authenticate_user!

  def index
  end

  def show
  end

  def edit
    @user = current_user;
  end

  def update
    @user = User.find(params[:id])
    if params[:user][:password].blank? and params[:user][:password_confirmation].blank?
      if @user.update_without_password(params[:user])
        redirect_to user_root_path
      else
        render :edit
      end
    else
      if @user.update_attributes(params[:user]) != true
        render :edit
      end
    end
  end

end

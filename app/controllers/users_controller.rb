class UsersController < ApplicationController
  before_filter :authenticate_user!

  def edit
    @user = current_user
  end

  def update
    @user = User.find(params[:id])
    if given_new_password_in_params?
      update_with_password
    else
      update_without_password
    end
  end

  private
  def given_new_password_in_params?
    !params[:user][:password].blank? or !params[:user][:password_confirmation].blank?
  end

  def update_with_password
    if @user.update_attributes(params[:user])
      render :update
    else
      render :edit
    end
  end

  def update_without_password
    if @user.update_without_password(params[:user])
      redirect_to user_root_path
    else
      render :edit
    end
  end
end

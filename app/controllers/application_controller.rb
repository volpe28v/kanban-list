class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :user_email

  def user_email
    @user_email = current_user ? current_user.email : ""
  end
end

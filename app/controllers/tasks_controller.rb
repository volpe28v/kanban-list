class TasksController < ApplicationController
  before_filter :authenticate_user!  

  def index
    @user_name = current_user.name
    @counts = Task.all_counts_by_name(@user_name)
#    @bg_img_name = AppConfig[:base_bg_path] + User.by_name(@user_name).bg_img == nil ? AppConfig[:default_bg_image] : User.by_name(@user_name).bg_img
    @bg_img_name = AppConfig[:base_bg_path] + AppConfig[:default_bg_image]
    @tasks = {
      :todo_high_tasks => Task.by_name_and_status(@user_name,:todo_h),
      :todo_mid_tasks  => Task.by_name_and_status(@user_name,:todo_m),
      :todo_low_tasks  => Task.by_name_and_status(@user_name,:todo_l),
      :doing_tasks     => Task.by_name_and_status(@user_name,:doing),
      :waiting_tasks   => Task.by_name_and_status(@user_name,:waiting),
      :done_tasks      => Task.by_name_and_status(@user_name,:done),
    }

    session[:user] = @user_name

    @recent_done_num = 15
  end

end

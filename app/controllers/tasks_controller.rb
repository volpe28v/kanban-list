class TasksController < ApplicationController
  before_filter :authenticate_user!  

  def index
    @user_name = current_user.name
    @counts = Task.all_counts_by_name(current_user.name)
    @bg_img_name = current_user.bg_img_path

    @tasks = {
      :todo_high_tasks => Task.by_name_and_status(@user_name,:todo_h),
      :todo_mid_tasks  => Task.by_name_and_status(@user_name,:todo_m),
      :todo_low_tasks  => Task.by_name_and_status(@user_name,:todo_l),
      :doing_tasks     => Task.by_name_and_status(@user_name,:doing),
      :waiting_tasks   => Task.by_name_and_status(@user_name,:waiting),
      :done_tasks      => Task.by_name_and_status(@user_name,:done),
    }

    @recent_done_num = 15
  end

  def create
    @task = Task.new
    @task.msg = params[:msg]
    @task.name = current_user.name
    @task.user = current_user
    @task.status = StatusTable[:todo_m]
    @task.save

    @counts = Task.all_counts_by_name(current_user.name)
  end

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status])
    task.msg = params[:msg]
    task.save

    @counts = Task.all_counts_by_name(current_user.name)
  end
end

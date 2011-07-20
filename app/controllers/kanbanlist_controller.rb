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
    @counts = Task.all_counts_by_name(@user_name)
    @bg_img_name = AppConfig[:base_bg_path] + User.by_name(@user_name).bg_img
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

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status])
    task.msg = params[:msg]
    task.save
    render :text => "updated"
  end

end

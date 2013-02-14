class DashboardController < ApplicationController
  def index
    @user = current_user
    @add_tasks  = @user.tasks.newest_add
    @done_tasks = @user.tasks.newest_done
    @oldest_tasks = @user.tasks.oldest_update
    @doing_tasks = @user.tasks.by_status(:doing)
    @today_tasks = @user.tasks.today_touch
    @books = books_count_info_array
    @task_counts = all_count_info
    @month_done_list = @user.tasks.done_month_list.sort{|a,b| a[:date] <=> b[:date] }
  end
end

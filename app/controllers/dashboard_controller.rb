class DashboardController < ApplicationController
  def index
    @user = current_user
    @add_tasks  = @user.tasks.newest_add
    @edit_tasks = @user.tasks.newest_edit
    @done_tasks = @user.tasks.newest_done
    @doing_tasks = @user.tasks.by_status(:doing).limit(10)
    @books = books_count_info_array
  end
end

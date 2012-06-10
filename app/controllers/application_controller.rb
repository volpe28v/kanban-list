# coding: utf-8
class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :user_email

  def user_email
    @user_email = current_user ? current_user.email : ""
  end

  def get_book_name
    current_book ? current_book.name : "All Tasks"
  end

  def get_prefix
    current_book ? current_book.name : ""
  end

  def get_task_counts
    current_book ? current_book.tasks.all_counts : current_user.tasks.all_counts
  end

  def get_tasks(done_num = 10)
    target_tasks = current_book ? current_book.tasks : current_user.tasks
    tasks = {
      :todo_high_tasks => target_tasks.by_status(:todo_h),
      :todo_mid_tasks  => target_tasks.by_status(:todo_m),
      :todo_low_tasks  => target_tasks.by_status(:todo_l),
      :doing_tasks     => target_tasks.by_status(:doing),
      :waiting_tasks   => target_tasks.by_status(:waiting),
      :done_tasks      => target_tasks.by_status(:done).limit(done_num),
    }
  end

  def current_book
    if session[:book_id] != nil and session[:book_id] != 0
      current_user.books.find_by_id(session[:book_id])
    else
      nil
    end
  end
end

class TasksController < ApplicationController
  before_filter :authenticate_user!
  before_filter :books_list

  def books_list
    @books_list = current_user.books
  end

  def index
    @user_name = current_user.name
    @counts = current_user.tasks.all_counts
    @bg_img_name = current_user.bg_img_path

    @recent_done_num = 15
    @tasks = get_tasks_by( current_user, @recent_done_num )
  end

  def create
    @task = Task.new(:msg => params[:msg],
                     :name => current_user.name,
                     :user => current_user)
    @task.update_status(:todo_m)
    @task.save

    @counts = current_user.tasks.all_counts
  end

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status])
    task.msg = params[:msg]
    task.save

    @counts = current_user.tasks.all_counts
    render :json => @counts, :callback => 'updateCountsJson'
  end

  def destroy
    task = Task.find(params[:id])
    task.delete

    @counts = current_user.tasks.all_counts
    render :json => @counts, :callback => 'updateCountsJson'
  end

  def filter_or_update
    @user_name = current_user.name
    @counts = current_user.tasks.all_counts
    @bg_img_name = current_user.bg_img_path
    @recent_done_num = 15

    if params[:filter] != ""
      @tasks = get_filtered_tasks_by( current_user, params[:filter], @recent_done_num )
    else
      @tasks = get_tasks_by( current_user, @recent_done_num )
    end

    render :partial => 'tasklist'
  end

  def donelist
    @tasks = current_user.tasks.by_status(:done)
    if params[:year].blank? == false
      select_month = Time.new( params[:year], params[:month])
      @tasks = @tasks.select_month(select_month)
    end
    @tasks = @tasks.paginate(:page => params[:page], :per_page => 100)

    @from_month = current_user.tasks.from_done_month
    @to_month   = current_user.tasks.to_done_month
  end

  def new_book
    @user_name = current_user.name
    @counts = current_user.tasks.all_counts
    @bg_img_name = current_user.bg_img_path

    new_book = Book.new({ name: params[:book_name]})
    new_book.user = current_user
    new_book.save

    @recent_done_num = 15
    @tasks = get_tasks_by( current_user, @recent_done_num )

    task_list_html = render_to_string :partial => 'tasklist'
    render :json => { task_list_html: task_list_html}, :callback => 'updateBookJson'
  end

  private
  def get_tasks_by( user ,done_num = 10)
      tasks = {
        :todo_high_tasks => user.tasks.by_status(:todo_h),
        :todo_mid_tasks  => user.tasks.by_status(:todo_m),
        :todo_low_tasks  => user.tasks.by_status(:todo_l),
        :doing_tasks     => user.tasks.by_status(:doing),
        :waiting_tasks   => user.tasks.by_status(:waiting),
        :done_tasks      => user.tasks.by_status(:done).limit(done_num),
      }
  end

  def get_filtered_tasks_by( user, filter_word, done_num = 10 )
      tasks = {
        :todo_high_tasks => user.tasks.by_status_and_filter(:todo_h,filter_word),
        :todo_mid_tasks  => user.tasks.by_status_and_filter(:todo_m, filter_word),
        :todo_low_tasks  => user.tasks.by_status_and_filter(:todo_l, filter_word),
        :doing_tasks     => user.tasks.by_status_and_filter(:doing,  filter_word),
        :waiting_tasks   => user.tasks.by_status_and_filter(:waiting,filter_word),
        :done_tasks      => user.tasks.by_status_and_filter(:done,   filter_word).limit(done_num),
      }
  end
end

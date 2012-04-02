class TasksController < ApplicationController
  before_filter :authenticate_user!
  before_filter :books_list

  def books_list
    @books_list = current_user.books
  end

  def index
    @user_name = current_user.name
    @counts = get_task_counts
    @bg_img_name = current_user.bg_img_path

    @recent_done_num = 15
    @tasks = get_tasks_by( current_user, @recent_done_num )
  end

  def create
    @task = Task.new(:msg => params[:msg],
                     :name => current_user.name,
                     :user => current_user)
    @task.update_status(:todo_m)

    if session[:book_id] != nil and session[:book_id] != 0
      @task.book = Book.find(session[:book_id])
    end

    @task.save
    @counts = get_task_counts
  end

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status])
    task.msg = params[:msg]
    task.save

    render :json => get_task_counts, :callback => 'updateCountsJson'
  end

  def destroy
    task = Task.find(params[:id])
    task.delete

    render :json => get_task_counts, :callback => 'updateCountsJson'
  end

  def filter_or_update
    @user_name = current_user.name
    @bg_img_name = current_user.bg_img_path
    @recent_done_num = 15

    if params[:filter] != ""
      @tasks = get_filtered_tasks_by( current_user, params[:filter], @recent_done_num )
    else
      @tasks = get_tasks_by( current_user, @recent_done_num )
    end

    task_list_html = render_to_string :partial => 'tasklist'
    render :json => { task_list_html: task_list_html, task_counts: get_task_counts }, :callback => 'updateBookJson'
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
    @bg_img_name = current_user.bg_img_path

    new_book = Book.new({ name: params[:book_name]})
    new_book.user = current_user
    new_book.save
    session[:book_id] = new_book.id

    @recent_done_num = 15
    @tasks = get_tasks_by( current_user, @recent_done_num )

    task_list_html = render_to_string :partial => 'tasklist'
    render :json => { task_list_html: task_list_html,
                      task_counts: get_task_counts,
                      new_book: { name: new_book.name, id: new_book.id }},
           :callback => 'updateBookJson'
  end

  def select_book
    @user_name = current_user.name
    @bg_img_name = current_user.bg_img_path

    session[:book_id] = params[:book_id].to_i

    @recent_done_num = 15
    @tasks = get_tasks_by( current_user, @recent_done_num )

    task_list_html = render_to_string :partial => 'tasklist'
    render :json => { task_list_html: task_list_html, task_counts: get_task_counts }, :callback => 'updateBookJson'
  end

  private
  def get_task_counts
    if session[:book_id] != nil and session[:book_id] != 0
      counts = current_user.books.find_by_id(session[:book_id]).tasks.all_counts
    else
      counts = current_user.tasks.all_counts
    end
  end

  def get_tasks_by( user ,done_num = 10)
    target_tasks = user.tasks
    if session[:book_id] != nil and session[:book_id] != 0
      target_tasks = user.books.find_by_id(session[:book_id]).tasks
    end

    tasks = {
      :todo_high_tasks => target_tasks.by_status(:todo_h),
      :todo_mid_tasks  => target_tasks.by_status(:todo_m),
      :todo_low_tasks  => target_tasks.by_status(:todo_l),
      :doing_tasks     => target_tasks.by_status(:doing),
      :waiting_tasks   => target_tasks.by_status(:waiting),
      :done_tasks      => target_tasks.by_status(:done).limit(done_num),
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

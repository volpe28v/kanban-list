# coding: utf-8
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
    @book_name = get_book_name
    @prefix = get_prefix

    @recent_done_num = 15
    @tasks = get_tasks( @recent_done_num )
  end

  def create
    @task = Task.new(:msg => params[:msg],
                     :name => current_user.name,
                     :user => current_user)
    @task.update_status(:todo_m)
    @task.book = get_book_id_in_msg(@task.msg)

    @task.save
    @counts = get_task_counts

  end

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status])
    task.msg = params[:msg]
    task.book = get_book_id_in_msg(task.msg)
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
    @book_name = get_book_name
    @prefix = get_prefix

    if params[:filter] != ""
      @tasks = get_filtered_tasks_by( current_user, params[:filter], @recent_done_num )
    else
      @tasks = get_tasks( @recent_done_num )
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

    @month_list = current_user.tasks.done_month_list
  end

  def new_book
    @user_name = current_user.name
    @bg_img_name = current_user.bg_img_path
    @recent_done_num = 15

    new_book_name = params[:book_name]

    aready_book = Book.find_by_name_and_user_id( new_book_name, current_user.id)
    if aready_book
      session[:book_id] = aready_book.id
      @tasks = get_tasks( @recent_done_num )
      @book_name = get_book_name
      @prefix = get_prefix
      task_list_html = render_to_string :partial => 'tasklist'
      render :json => { task_list_html: task_list_html,
                        task_counts: get_task_counts},
             :callback => 'updateBookJson'
    else
      new_book = Book.new({ name: new_book_name})
      new_book.user = current_user
      new_book.save
      session[:book_id] = new_book.id

      @tasks = get_tasks( @recent_done_num )
      @book_name = get_book_name
      @prefix = get_prefix
      task_list_html = render_to_string :partial => 'tasklist'
      render :json => { task_list_html: task_list_html,
                        task_counts: get_task_counts,
                        new_book: { name: new_book.name, id: new_book.id }},
             :callback => 'updateBookJson'
    end
  end

  def select_book
    @user_name = current_user.name
    @bg_img_name = current_user.bg_img_path

    session[:book_id] = params[:book_id].to_i

    @recent_done_num = 15
    @tasks = get_tasks( @recent_done_num )
    @book_name = get_book_name
    @prefix = get_prefix

    task_list_html = render_to_string :partial => 'tasklist'
    render :json => { task_list_html: task_list_html, task_counts: get_task_counts }, :callback => 'updateBookJson'
  end

  def send_mail
    mail_addr = params[:mail_addr]

    TaskMailer.all_tasks(current_user, get_book_name, mail_addr, get_tasks(@recent_done_num)).deliver
    render :json => { addr: mail_addr }, :callback => 'showMailResult'
  end

  private
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

  def get_book_id_in_msg(msg)
    if /^【(.+)】/ =~ msg
      current_user.books.find_by_name($1) || nil
    else
      return nil
    end
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

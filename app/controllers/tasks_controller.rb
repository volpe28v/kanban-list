# coding: utf-8
class TasksController < ApplicationController
  before_filter :authenticate_user!

  def index
    if request.smart_phone?
      @user_name = current_user.name
      @counts = get_task_counts
      @book_name = get_book_name
      @prefix = get_prefix
      @recent_done_num = 10
      @tasks = get_tasks( "", @recent_done_num )
    end
  end

  def create
    task = Task.new(:msg => params[:msg],
                     :name => current_user.name,
                     :user => current_user)
    task.update_status(:todo_m)
    task.book = task.get_book_id_in_msg_by_user(current_user)
    task.save

    move_id = is_moved_from_book?(task) ? task.id : 0
    task_html = render_to_string :partial => 'task', :locals => {:task => task, :display => "none" }

    render :json => { id: task.id,
                      li_html: task_html,
                      move_task_id: move_id,
                      task_counts: get_task_counts,
                      all_books: get_all_book_counts },
           :callback => 'addTodoResponse'
  end

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status])
    task.msg = params[:msg]
    task.book = task.get_book_id_in_msg_by_user(current_user)
    task.save

    move_id = is_moved_from_book?(task) ? task.id : 0

    do_hooks(task)
    render :json => { task_counts: get_task_counts,
                      move_task_id: move_id,
                      all_books: get_all_book_counts },
           :callback => 'updateTaskJson'
  end

  def destroy
    task = Task.find(params[:id])
    task.delete

    render :json => { task_counts: get_task_counts,
                      move_task_id: 0,
                      all_books: get_all_book_counts },
           :callback => 'updateTaskJson'
  end

  def update_order
    if params[:id] == nil
      render :text => "update_order noop"
      return
    end

    # 並び順の変更はタイムスタンプを更新したくない
    Task.record_timestamps = false
    params[:id].each_with_index do |task_id,i|
      target_task = Task.find(task_id)
      target_task.update_attribute(:order_no, i)
    end
    Task.record_timestamps = true

    render :text => "update_order ok"
  end

  def filter_or_update
    set_layout(params[:layout])
    render_json_for_updateBookJson(params[:filter], 15)
  end

  def silent_update
    @user_name = current_user.name
    @recent_done_num = 15
    @tasks = get_tasks( params[:filter], @recent_done_num )

    render :json => { task_list_html: get_task_list_html,
                      task_counts: get_task_counts,
                      all_books: get_all_book_counts },
           :callback => 'updateSilentJson'
  end

  def donelist
    @tasks = current_tasks.by_status(:done)
    if params[:year].blank? == false
      select_month = Time.new( params[:year], params[:month])
      @tasks = @tasks.select_month(select_month)
    end
    @tasks = @tasks.paginate(:page => params[:page], :per_page => 100)

    @month_list = current_tasks.done_month_list
  end

  def send_mail
    mail_addr    = params[:mail_addr]
    mail_comment = params[:comment]

    TaskMailer.all_tasks(current_user,
                         current_book,
                         mail_addr,
                         mail_comment,
                         get_tasks("", @recent_done_num)
                        ).deliver
    render :json => { addr: mail_addr }, :callback => 'showMailResult'
  end

  private

  def do_hooks(task)
    case task.status_sym
    when :done
      hook_name = "#{Rails.root}/hooks/update_task_#{current_user.email}"
      command = "source #{hook_name} \"DONE\" \"#{helper.strip_tags task.msg}\""
      system(command) if File.exist?(hook_name)
    end
  end

  def is_moved_from_book?(task)
    (current_book != nil) and (current_book.id != (task.book ? task.book.id : 0 ))
  end

  def set_layout(layout_name)
    session[:layout] = layout_name if layout_name
  end
end

class BooksController < ApplicationController
  def create
    @user_name = current_user.name
    @recent_done_num = 15

    new_book_name = params[:book_name]

    aready_book = Book.find_by_name_and_user_id( new_book_name, current_user.id)
    if aready_book
      session[:book_id] = aready_book.id
      render_current_book
    else
      new_book = Book.new({ name: new_book_name})
      new_book.user = current_user
      new_book.save

      session[:book_id] = new_book.id
      render_current_book({new_book: { name: new_book.name, id: new_book.id }})
    end
  end

  def show
    session[:book_id] = params[:id]
    render_current_book
  end

  def destroy
    if current_book != nil
      remove_book_name = current_book.name
      remove_book_id = current_book.id

      current_book.tasks.destroy_all
      current_book.destroy
      session[:book_id] = 0
      render_current_book({remove_book: { name: remove_book_name, id: remove_book_id }})
    else
      session[:book_id] = 0
      render_current_book
    end
  end

  private
  def render_current_book(option = {})
    @recent_done_num = 15
    @tasks = get_tasks( @recent_done_num )
    @book_name = get_book_name
    @prefix = get_prefix

    task_list_html = render_to_string :partial => 'tasks/tasklist'
    render :json => { task_list_html: task_list_html, task_counts: get_task_counts }.merge(option), :callback => 'updateBookJson'
  end
end

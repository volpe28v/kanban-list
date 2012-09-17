class TaskMailer < ActionMailer::Base
  default from: "KanbanList<kanbanlist.info@gmail.com>"

  def all_tasks(user, book, addr, comment, tasks)
    @user = user
    @book = book
    @tasks = tasks
    @comment = comment

    book_name = @book ? @book.name : Book.default_name
    mail(:to => addr,
         :subject => "#{@user.name} - [#{book_name}]")
  end
end

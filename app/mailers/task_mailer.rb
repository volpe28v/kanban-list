class TaskMailer < ActionMailer::Base
  default from: "KanbanList<kanbanlist.info@gmail.com>"

  def all_tasks(user, book, addr, tasks)
    @user = user
    @book = book
    @tasks = tasks

    book_name = @book ? @book.name : Book.default_name
    mail(:to => addr,
         :subject => "#{@user.name} - [#{book_name}]")
  end
end

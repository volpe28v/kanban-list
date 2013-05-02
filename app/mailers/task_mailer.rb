class TaskMailer < ActionMailer::Base
  default from: "KanbanList<#{ENV['MAIL_ADDR']}>"

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

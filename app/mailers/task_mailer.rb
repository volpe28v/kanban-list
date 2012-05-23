class TaskMailer < ActionMailer::Base
  default from: "kanbanlist.info@gmail.com"

  def all_tasks(user,book_name,addr,tasks)
    @user = user
    @book_name = book_name
    @tasks = tasks
    mail(:to => addr,
         :subject => "#{@user.name}'s tasks")
  end
end

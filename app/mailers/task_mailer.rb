class TaskMailer < ActionMailer::Base
  default from: "volpe.hd28v@gmail.com"

  def all_tasks(user,tasks)
    @user = user
    @tasks = tasks
    mail(:to => user.email,
         :subject => "Welcome to KanbanList")
  end
end

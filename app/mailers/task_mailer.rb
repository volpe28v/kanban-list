class TaskMailer < ActionMailer::Base
  default from: "kanbanlist.info@gmail.com"

  def all_tasks(user,addr,tasks)
    @user = user
    @tasks = tasks
    mail(:to => addr,
         :subject => "#{@user.name}'s tasks")
  end
end

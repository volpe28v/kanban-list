# coding: utf-8

sample = User.find_or_create_by_email(:name => "サンプルアカウント",
                             :email => "sample@kanban.list",
                             :password => "sample",
                             :password_confirmation => "sample")
p "add sample user"
sample.tasks.build(:msg => "JavaScript", :status => 0 )
sample.tasks.build(:msg => "Perl", :status => 1 )
sample.tasks.build(:msg => "C++", :status => 2 )
sample.tasks.build(:msg => "Node.js", :status => 3 )
sample.tasks.build(:msg => "Ruby on Rails", :status => 4 )
sample.tasks.build(:msg => "done task", :status => 5 )

sample.save
p "add tasks for sample user"

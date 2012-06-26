class Book < ActiveRecord::Base
  belongs_to :user
  has_many :tasks

  [:todo_h,:todo_m,:todo_l,:doing,:waiting,:done].each{|s|
    define_method "#{s}_count" do
      self.tasks.by_status(s).count
    end
  }
end

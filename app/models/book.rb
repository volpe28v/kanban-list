class Book < ActiveRecord::Base
  belongs_to :user
  has_many :tasks

  @@default_name = "All Tasks"

  def self.default_name
    @@default_name
  end

  [:todo_h,:todo_m,:todo_l,:doing,:waiting,:done].each{|s|
    define_method "#{s}_count" do
      self.tasks.by_status(s).count
    end
  }
end

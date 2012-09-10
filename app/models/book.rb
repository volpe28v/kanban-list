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

  def task_count_info
      book_info = self.tasks.all_counts
      book_info['active_task'] = book_info[:todo_h] + book_info[:todo_m] + book_info[:todo_l] + book_info[:doing] + book_info[:waiting]
      book_info['id'] = self.id
      book_info['name'] = self.name
      book_info
  end
end

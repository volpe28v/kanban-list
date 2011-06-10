StatusTable = {
  :todo_h  => 0,
  :todo_m  => 1,
  :todo_l  => 2,
  :doing   => 3,
  :waiting => 4,
  :done    => 5
}

class Task < ActiveRecord::Base
  scope :by_name_and_status, lambda {|name,status|
    where(:name => name, :status => StatusTable[status])
  }

  scope :filterd, lambda {|name, filter|
    where("name = ? and msg LIKE ?", name ,"%#{URI.encode(filter)}%").order('updated_at DESC')
  }

  scope :done_by_name, lambda {|name|
    where(:status => StatusTable[:done], :name => name).order('updated_at DESC')
  }

  def status_sym
    StatusTable.each_key {|key| return key if StatusTable[key] == self.status }
  end
end

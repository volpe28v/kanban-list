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

  scope :done, where(:status => StatusTable[:done]).order('updated_at DESC')

  scope :doing_by_name, lambda {|name|
    where(:status => StatusTable[:doing], :name => name).order('updated_at DESC')
  }

  scope :today_done_by_name, lambda {|name|
    where("status = ? and name = ? and updated_at LIKE ?", StatusTable[:done], name, "#{Time.now.strftime("%Y-%m-%d")}%").order('updated_at DESC' )
  }

  def self.all_counts_by_name(name)
    counts = {}
    StatusTable.each_key{|key|
      counts[key.to_sym] = self.by_name_and_status(name,key.to_sym).count
    }
    counts
  end

  def status_sym
    StatusTable.each_key {|key| return key if StatusTable[key] == self.status }
  end

  def update_status( status )
    self.status = StatusTable[status.to_sym]
  end
end

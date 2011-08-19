StatusTable = {
  :todo_h  => 0,
  :todo_m  => 1,
  :todo_l  => 2,
  :doing   => 3,
  :waiting => 4,
  :done    => 5
}

class Task < ActiveRecord::Base
  belongs_to :user

  scope :by_name_and_status, lambda {|name,status|
    where(:name => name, :status => StatusTable[status])
  }

  scope :by_status, lambda {|status|
    where(:status => StatusTable[status]).order("updated_at DESC")
  }

  scope :by_status_and_filter, lambda {|status,filter|
    where("status = ? and msg LIKE ?", StatusTable[status] , "%#{URI.decode(filter)}%").order('updated_at DESC')
  }

  scope :filtered, lambda {|name, filter|
    where("name = ? and msg LIKE ?", name ,"%#{URI.encode(filter)}%").order('updated_at DESC')
  }

  scope :done, where(:status => StatusTable[:done]).order('updated_at DESC')

  scope :doing, where(:status => StatusTable[:doing]).order('updated_at DESC')

  scope :today_done, where("status = ? and updated_at LIKE ?", StatusTable[:done], "#{Time.now.strftime("%Y-%m-%d")}%").order('updated_at DESC' )

  def self.all_counts
    counts = {}
    StatusTable.each_key{|key|
      counts[key.to_sym] = self.by_status(key.to_sym).count
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

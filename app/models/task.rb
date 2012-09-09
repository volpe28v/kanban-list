# coding: utf-8
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
  belongs_to :book

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

  scope :select_month, lambda {|select_mon|
    where(" updated_at >= ? and updated_at < ? ", select_mon, select_mon + 1.month )
  }

  def self.all_counts
    counts = {}
    StatusTable.each_key{|key|
      counts[key.to_sym] = self.by_status(key.to_sym).count
    }
    counts
  end

  def self.done_month_list
    from_month = self.from_done_month
    to_month   = self.to_done_month

    month_list = []
    while from_month <= to_month do
      month_list << { date: to_month, count: self.done.select_month(to_month).count}
      to_month -= 1.month
    end
    return month_list
  end

  def self.from_done_month
    last_task = self.by_status(:done).last
    if last_task
      from_time = last_task.updated_at
      Time.new(from_time.year, from_time.mon)
    else
      Time.new
    end
  end

  def self.to_done_month
    first_task = self.by_status(:done).first
    if first_task
      to_time = first_task.updated_at
      Time.new(to_time.year, to_time.mon)
    else
      Time.new
    end
  end

  def status_sym
    StatusTable.key(status)
  end

  def update_status( status )
    self.status = StatusTable[status.to_sym]
  end

  def get_book_id_in_msg_by_user(user)
    if /^\[(.+?)\]/ =~ self.msg
      user.books.find_or_create_by_name($1)
    elsif /^【(.+?)】/ =~ self.msg
      user.books.find_or_create_by_name($1)
    else
      return nil
    end
  end

  def msg_without_book_name(book)
    return self.msg if book == nil

    book_name_patterns = [
      Regexp.new(/^\[(.+?)\][ ]*/),
      Regexp.new(/^【(.+?)】[ ]*/)
    ]

    book_name_patterns.each{|pattern|
      if pattern =~ self.msg
        return self.msg.sub(pattern,"")
      end
    }

    self.msg
  end
end

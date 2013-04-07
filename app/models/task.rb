# coding: utf-8
class Task < ActiveRecord::Base
  belongs_to :user
  belongs_to :book

  @@status_table = {
    :todo_h  => 0,
    :todo_m  => 1,
    :todo_l  => 2,
    :doing   => 3,
    :waiting => 4,
    :done    => 5
  }

  @@book_name_patterns = [
    Regexp.new(/^\[(.+?)\][ ]*/),
    Regexp.new(/^【(.+?)】[ ]*/)
  ]

  scope :by_name_and_status, lambda {|name,status|
    where(:name => name, :status => @@status_table[status])
  }

  scope :by_status, lambda {|status|
    where(:status => @@status_table[status]).order("order_no ASC, updated_at DESC")
  }

  scope :by_status_and_filter, lambda {|status,filter|
    where("status = ? and msg LIKE ?", @@status_table[status] , "%#{URI.decode(filter)}%").order('order_no ASC, updated_at DESC')
  }

  scope :filtered, lambda {|name, filter|
    where("name = ? and msg LIKE ?", name ,"%#{URI.encode(filter)}%").order('order_no ASC, updated_at DESC')
  }

  scope :done, lambda { where(:status => @@status_table[:done]).order('updated_at DESC') }
  scope :done_and_filter, lambda {|filter|
    where("status = ? and msg LIKE ?", @@status_table[:done] , "%#{URI.decode(filter)}%").order('updated_at DESC')
  }

  scope :today_done, where("status = ? and updated_at LIKE ?", @@status_table[:done], "#{Time.now.strftime("%Y-%m-%d")}%").order('updated_at DESC' )

  scope :select_month, lambda {|select_mon|
    where(" updated_at >= ? and updated_at < ? ", select_mon, select_mon + 1.month )
  }


  scope :newest_add, where("status != ?", @@status_table[:done]).order('created_at DESC' ).limit(10)
  scope :newest_done, where("status = ?", @@status_table[:done]).order('updated_at DESC' ).limit(10)
  scope :oldest_update, where("status != ?", @@status_table[:done]).order('updated_at ASC' ).limit(10)

  def self.all_counts
    counts = {}
    @@status_table.each_key {|status| counts[status] = 0 }

    self.group(:status).count(:status).each {|status_value, count|
      counts[@@status_table.key(status_value)] = count
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
    last_task = self.done.last
    if last_task
      from_time = last_task.updated_at
      Time.new(from_time.year, from_time.mon)
    else
      Time.now
    end
  end

  def self.to_done_month
    first_task = self.done.first
    if first_task
      to_time = first_task.updated_at
      Time.new(to_time.year, to_time.mon)
    else
      Time.now
    end
  end

  def self.created_today_count
    self.where('created_at >= ? and created_at <= ?', 1.day.ago, Time.now).count
  end

  def self.today_touch
    self.where('status != ? and updated_at >= ? and updated_at <= ?', @@status_table[:done], 1.day.ago, Time.now).order("updated_at DESC")
  end

  def status_sym
    @@status_table.key(status)
  end

  def update_status( status )
    self.status = @@status_table[status.to_sym]
  end

  def get_book_id_in_msg_by_user(user)
    @@book_name_patterns.each{|pattern|
      if pattern =~ self.msg
        return user.books.find_or_create_by_name($1)
      end
    }

    nil
  end

  def msg_without_book_name(book)
    return self.msg if book == nil

    @@book_name_patterns.each{|pattern|
      if pattern =~ self.msg
        return self.msg.sub(pattern,"")
      end
    }

    self.msg
  end

  def book_name
    if self.book != nil
      self.book.name
    else
      ""
    end
  end
end

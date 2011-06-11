class User < ActiveRecord::Base
  def self.by_name(name)
    user = nil
    (user = where(:name => name)).first != nil ? user.first : nil
  end

  def self.exist?( name )
    where(:name => name).size != 0 ? true : false
  end
end

class User < ActiveRecord::Base
  scope :all_user, order('name')

  def self.add_user(name)
    if exist?(name) 
      false
    else
      User.create(:name => name,
                  :bg_img => AppConfig[:default_bg_image],
                  :layout => AppConfig[:default_layout],
                  :pomo => 0
                 )
      true
    end

  end

  def self.by_name(name)
    user = nil
    (user = where(:name => name)).first != nil ? user.first : nil
  end

  def self.exist?( name )
    where(:name => name).size != 0 ? true : false
  end

  def self.bg_img_by_name(name)
    AppConfig[:default_bg_image] + where(:name => name).first.bg_img
  end

  def self.set_bg_img(name, bg_img)
    by_name(name).update_attributes(:bg_img => bg_img)
  end

  def self.layout_by_name(name)
    AppConfig[:default_layout] + where(:name => name).first.layout
  end

  def self.set_layout(name, layout)
    by_name(name).update_attributes(:layout => layout)
  end

  def self.inc_pomo(name)
    update_pomo = by_name(name).pomo + 1
    by_name(name).update_attributes(:pomo => update_pomo)
  end
end

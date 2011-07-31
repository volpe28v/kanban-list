class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  attr_accessible :name, :bg_img, :layout, :pomo

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
    AppConfig[:base_bg_path] + where(:name => name).first.bg_img
  end

  def self.set_bg_img(name, bg_img)
    by_name(name).update_attributes(:bg_img => bg_img)
  end

  def self.layout_by_name(name)
    where(:name => name).first.layout
  end

  def self.set_layout(name, layout)
    by_name(name).update_attributes(:layout => layout)
  end

  def self.inc_pomo(name)
    update_pomo = by_name(name).pomo + 1
    by_name(name).update_attributes(:pomo => update_pomo)
  end
end

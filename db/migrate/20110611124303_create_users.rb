class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.string :name
      t.string :pass
      t.string :bg_img
      t.string :layout
      t.integer :pomo

      t.timestamps
    end
  end

  def self.down
    drop_table :users
  end
end

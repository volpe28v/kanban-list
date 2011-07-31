class AddUseridToTask < ActiveRecord::Migration
  def self.up
    add_column :tasks, :user_id, :integer, :nil => false
  end

  def self.down
    remove_column :tasks, :user_id
  end
end

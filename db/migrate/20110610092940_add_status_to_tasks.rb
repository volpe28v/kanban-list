class AddStatusToTasks < ActiveRecord::Migration
  def self.up
    add_column :tasks, :status, :integer
  end

  def self.down
    remove_column :tasks, :status
  end
end

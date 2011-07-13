class AddPomoToTask < ActiveRecord::Migration
  def self.up
    add_column :tasks, :pomo, :integer, :default => 0
  end

  def self.down
    remove_column :tasks, :pomo
  end
end

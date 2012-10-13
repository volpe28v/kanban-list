class AddOrderToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :order_no, :integer, :default => 0
  end
end

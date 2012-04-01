class AddBookIdToTask < ActiveRecord::Migration
  def change
    add_column :tasks, :book_id, :integer
  end
end

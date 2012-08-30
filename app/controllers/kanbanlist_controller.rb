require 'task'
class KanbanlistController < ApplicationController
  def index
    @all_user_count = User.count
    @all_task_count = Task.count
  end
end

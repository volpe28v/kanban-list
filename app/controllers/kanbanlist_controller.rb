class KanbanlistController < ApplicationController
  def index
    @all_user = User.all_user

  end

end

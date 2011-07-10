class KanbanlistController < ApplicationController
  def index
    @all_user = User.all_user
  end

  def new_user

    redirect_to :action => "user"
  end

  def user

  end

end

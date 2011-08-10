class KanbanlistController < ApplicationController
  def index
    @all_user = User.all_user
  end

  def new_user
    User.add_user(params[:user])
    redirect_to :action => "user",:user => params[:user]
  end

  def update
    task = Task.find(params[:id])
    task.update_status(params[:status])
    task.msg = params[:msg]
    task.save
    render :text => "updated"
  end

end

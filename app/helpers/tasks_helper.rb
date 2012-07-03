module TasksHelper
  def to_js_array(msg)
    raw "[" + msg.split("\n").map{|ts| "'" + ts + "'" }.join(",") + "]"
  end
end

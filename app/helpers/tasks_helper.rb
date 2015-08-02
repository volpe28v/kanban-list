module TasksHelper
  def to_js_array(msg)
    msg = msg.gsub(/'/,"\"")
    msg_array = "[" + msg.split("\n").map{|ts| "'" + ts + "'" }.join(",") + "]"
    raw msg_array
  end
end

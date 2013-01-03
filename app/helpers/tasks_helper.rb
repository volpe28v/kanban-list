module TasksHelper
  def to_js_array(msg)
    msg = msg.gsub(/'/,"\"")
    raw "[" + msg.split("\n").map{|ts| "'" + ts + "'" }.join(",") + "]"
  end
end

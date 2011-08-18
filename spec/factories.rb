Factory.define :task_1, :class => Task do |f|
  f.status 0
  f.msg "hello"
end

Factory.define :task_2, :class => Task do |f|
  f.status 1
  f.msg "hello task_m"
end

Factory.define :volpe, :class => User do |f|
  f.name "volpe"
  f.password "volpevolpe"
  f.email "volpe@volpe.com"
  f.bg_img "hoge.jpg"
  f.layout "landscape"
  f.pomo 9
  f.tasks {
    [Factory(:task_1), Factory(:task_2)]
  }
end

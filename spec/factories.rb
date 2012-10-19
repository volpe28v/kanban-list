Factory.define :task_1, :class => Task do |f|
  f.status 0
  f.msg "hello todo_h"
end

Factory.define :task_2, :class => Task do |f|
  f.status 1
  f.msg "hello task_m"
end

Factory.define :task_3, :class => Task do |f|
  f.status 2
  f.msg "hello task_l"
end

Factory.define :task_4, :class => Task do |f|
  f.status 3
  f.msg "hello doing"
end

Factory.define :task_5, :class => Task do |f|
  f.status 4
  f.msg "hello waiting"
end

Factory.define :task_6, :class => Task do |f|
  f.status 5
  f.msg "hello done"
end

Factory.define :task_7, :class => Task do |f|
  f.status 5
  f.msg "hello today done"
  f.updated_at DateTime.now
end

Factory.define :volpe, :class => User do |f|
  f.name     "volpe"
  f.password "volpevolpe"
  f.email    "volpe@volpe.com"
  f.bg_img   "hoge.jpg"
  f.layout   "landscape"
  f.pomo     9
  f.tasks {
    [
      Factory(:task_1),
      Factory(:task_2),
      Factory(:task_3),
      Factory(:task_4),
      Factory(:task_5),
      Factory(:task_6),
      Factory(:task_7)
    ]
  }
end

Factory.define :work_book, :class => Book do |b|
  b.name "work"
  b.tasks {
    [
      Factory(:task_1),
      Factory(:task_2),
      Factory(:task_3),
      Factory(:task_4),
      Factory(:task_5),
      Factory(:task_6),
      Factory(:task_7)
    ]
  }
end


FactoryGirl.define do
  factory :task_1, :class => Task do
    status 0
    msg "hello todo_h"
  end
end

FactoryGirl.define do
  factory :task_2, :class => Task do
    status 1
    msg "hello task_m"
  end
end

FactoryGirl.define do
  factory :task_3, :class => Task do |f|
    f.status 2
    f.msg "hello task_l"
  end
end

FactoryGirl.define do
  factory :task_4, :class => Task do |f|
    f.status 3
    f.msg "hello doing"
  end
end

FactoryGirl.define do
  factory :task_5, :class => Task do |f|
    f.status 4
    f.msg "hello waiting"
  end
end

FactoryGirl.define do
  factory :task_6, :class => Task do |f|
    f.status 5
    f.msg "hello done"
  end
end

FactoryGirl.define do
  factory :task_7, :class => Task do |f|
    f.status 5
    f.msg "hello today done"
    f.updated_at DateTime.now
  end
end

FactoryGirl.define do
  factory :volpe, :class => User do |f|
    f.name     "volpe"
    f.password "volpevolpe"
    f.email    "volpe@volpe.com"
    f.bg_img   "hoge.jpg"
    f.layout   "landscape"
    f.pomo     9
    f.tasks {
      [
        FactoryGirl.create(:task_1),
        FactoryGirl.create(:task_2),
        FactoryGirl.create(:task_3),
        FactoryGirl.create(:task_4),
        FactoryGirl.create(:task_5),
        FactoryGirl.create(:task_6),
        FactoryGirl.create(:task_7)
    ]
    }
  end
end

FactoryGirl.define do
  factory :work_book, :class => Book do |b|
    b.name "work"
    b.tasks {
      [
        FactoryGirl.create(:task_1),
        FactoryGirl.create(:task_2),
        FactoryGirl.create(:task_3),
        FactoryGirl.create(:task_4),
        FactoryGirl.create(:task_5),
        FactoryGirl.create(:task_6),
        FactoryGirl.create(:task_7)
    ]
    }
  end
end


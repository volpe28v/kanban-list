require 'spec_helper'

describe User do
  fixtures :users

  describe "ユーザ追加" do
    context "既に存在する場合" do
      before do
        @add_result = User.add_user("baggio")
      end 

      subject{ @add_result }

      it "戻り値 false " do
        subject.should be_false
      end
    end

    context "存在しない場合" do
      before do
        @add_result = User.add_user("zidane")
      end 

      subject{ @add_result }

      it "戻り値 true " do
        subject.should be_true
      end

      it "ユーザが登録されること" do
        User.find_by_name("zidane").should_not be_nil
      end

      it "初期値が正しいこと" do
        add_user = User.find_by_name("zidane")
        add_user.bg_img.should == AppConfig[:default_bg_image]
        add_user.layout.should == AppConfig[:default_layout]
        add_user.pomo.should == 0
      end

    end
  end

  describe "指定ユーザ存在確認" do
    context "存在する場合" do
      before do
        @exist = User.exist?("volpe")
      end
      subject{ @exist }

      it "戻り値 true " do
        subject.should be_true
      end
    end

    context "存在しない場合" do
      before do
        @exist = User.exist?("delpiero")
      end
      subject{ @exist }

      it "戻り値 false " do
        subject.should be_false
      end
    end
  end

  describe "指定ユーザのレコードを取得する" do
    context "存在する場合" do
      before do
        @user = User.by_name("volpe")
      end

      subject{@user}
      it { subject.should_not == nil }
      it { subject.name.should == "volpe" }
    end
    context "存在しない場合" do
      before do
        @user = User.by_name("delpiero")
      end

      subject{@user}
      it { subject.should == nil }
    end
  end

  describe "全てのユーザを取得する" do
    before do
      @users = User.all_user
    end

    subject{@users}
    it { subject.size.should >= 1 }
  end

  describe "指定ユーザの背景画像名を取得する" do
    before do
      @bg_img_name = User.bg_img_by_name("volpe")
    end
    subject{@bg_img_name}
    it { subject.should == AppConfig[:default_bg_image] + "hoge.jpg" }
  end

  describe "指定ユーザに背景画像を設定する" do
    before do
      User.set_bg_img("volpe","firenze.jpg")
    end
    it { User.bg_img_by_name("volpe").should == AppConfig[:default_bg_image] + "firenze.jpg" }
  end

  describe "指定ユーザのレイアウト名を取得する" do
    before do
      @layout_name = User.layout_by_name("volpe")
    end
    subject{@layout_name}
    it { subject.should == AppConfig[:default_layout] + "landscape" }
  end

  describe "指定ユーザにレイアウトを設定する" do
    before do
      User.set_layout("volpe","normal.tmpl")
    end
    it { User.layout_by_name("volpe").should == AppConfig[:default_layout] + "normal.tmpl" }
  end

  describe "ポモドーロ回数をインクリメントする" do
    before do
      User.inc_pomo("volpe")
    end
    it { User.by_name("volpe").pomo.should == 10 }
  end
end

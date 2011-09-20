# coding: utf-8
require 'spec_helper'

describe User do
  fixtures :users

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
    it { subject.should == AppConfig[:base_bg_path] + "hoge.jpg" }
  end

  describe "指定ユーザに背景画像を設定する" do
    before do
      User.set_bg_img("volpe","firenze.jpg")
    end
    it { User.bg_img_by_name("volpe").should == AppConfig[:base_bg_path] + "firenze.jpg" }
  end

  describe "指定ユーザのレイアウト名を取得する" do
    before do
      @layout_name = User.layout_by_name("volpe")
    end
    subject{@layout_name}
    it { subject.should == "landscape" }
  end

  describe "指定ユーザにレイアウトを設定する" do
    before do
      User.set_layout("volpe","normal")
    end
    it { User.layout_by_name("volpe").should == "normal" }
  end

  describe "ポモドーロ回数をインクリメントする" do
    before do
      User.inc_pomo("volpe")
    end
    it { User.by_name("volpe").pomo.should == 10 }
  end
end

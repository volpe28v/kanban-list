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
end

if RUBY_VERSION =~ /1.9/
    Encoding.default_external = Encoding::UTF_8
    Encoding.default_internal = Encoding::UTF_8
end

source 'http://rubygems.org'

gem 'rails', '3.1.10'

# Bundle edge Rails instead:
# gem 'rails',     :git => 'git://github.com/rails/rails.git'

gem 'sqlite3'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails', "  ~> 3.1.0"
  gem 'coffee-rails', "~> 3.1.0"
  gem 'uglifier'
end

gem 'jquery-rails'

gem 'will_paginate'
gem 'devise', '1.5.4'
gem 'rails_autolink'
gem 'rake'

gem 'jpmobile'
gem 'jpmobile-terminfo'

group :development, :test do
  gem 'rspec'
  gem 'rspec-rails'
  gem 'growl'
  gem 'guard-rspec'
  gem 'factory_girl'
  gem 'factory_girl_rails'
#  gem 'rcov'
#  gem 'ci_reporter'
end

group :production do
  gem 'pg'
  gem 'execjs'
  gem 'therubyracer', '0.9.8'
end

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test do
  gem 'turn', :require => false
end

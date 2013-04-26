source "http://rubygems.org"

gem "rake"

gem "sprockets",      "~> 2.9.2"

gem "rack-reverse-proxy", :require => "rack/reverse_proxy"

# All the following are Guard related ...

gem "guard",           "~> 1.7.0"
gem "guard-shell",     "~> 0.5.1"

# FS Notification libraries for Guard (non-polling)

#def darwin_only(require_as)
#  RbConfig::CONFIG['host_os'] =~ /darwin/ && require_as
#end

#def linux_only(require_as)
#  RbConfig::CONFIG['host_os'] =~ /linux/ && require_as
#end

#def windows_only(require_as)
#  RbConfig::CONFIG['host_os'] =~ /mingw|mswin/i && require_as
#end

#gem 'wdm',        "~> 0.1.0", :require => windows_only('wdm')

group :development do
  gem 'growl'
end

group :development do
  gem 'rb-inotify', :require => false
  gem 'rb-fsevent', :require => false
  gem 'rb-fchange', :require => false
end

# Guardfile
# More info at https://github.com/guard/guard#readme

def command(cmd)
  puts cmd
  system(cmd)
end

guard 'shell' do
  watch (/(^lib\/.+)|(^app\/.+)/) do
    command('rake') #for windows when you have set PATH with "RubyIstallation folder"/bin
  end
end

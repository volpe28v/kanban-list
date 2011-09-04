AppConfig = YAML.load_file("#{::Rails.root.to_s}/config/settings.yml")[::Rails.env].symbolize_keys


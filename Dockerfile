from 24c02/snarf:latest
workdir /app

copy Gemfile Gemfile.lock /app/
run bundle install

copy . /app

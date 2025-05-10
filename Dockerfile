from 24c02/snarf:latest

copy . /app

workdir /app

run bundle install
FROM ruby:3.3.6

WORKDIR /dino
COPY Gemfile Gemfile.lock /dino/
RUN bundle install

COPY . /dino

CMD ["bundle", "exec", "rackup", "--host", "0.0.0.0", "-p", "1312"]

EXPOSE 1312
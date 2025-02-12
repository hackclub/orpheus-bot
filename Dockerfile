FROM pypy:3

WORKDIR /dino

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "pypy3", "boot.py", "-p $PORT" ]
FROM pypy:3

WORKDIR /dino

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 1312
CMD [ "pypy3", "boot.py", "-p", "1312", "-l", "WARN"]
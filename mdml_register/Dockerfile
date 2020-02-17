FROM golang:1.13.1-buster
WORKDIR /bin/
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install mosquitto -y
RUN apt-get install python-setuptools -y
RUN wget https://sourceforge.net/projects/s3tools/files/s3cmd/2.0.1/s3cmd-2.0.1.tar.gz
RUN tar xzf s3cmd-2.0.1.tar.gz
WORKDIR /bin/s3cmd-2.0.1/
RUN python setup.py install
WORKDIR /bin/
RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc
RUN chmod +x mc

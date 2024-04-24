# set base image (host OS)
FROM python:3.8-alpine as builder

# set the working directory in the container
WORKDIR /

COPY . .

RUN apk add g++

# install dependencies
RUN pip install -r requirements.txt

EXPOSE 9000
# command to run on container start
CMD [ "python", "main.py" ]
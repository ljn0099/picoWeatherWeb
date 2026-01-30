FROM docker.io/library/nginx:alpine

COPY ./app/* /usr/share/nginx/html/

EXPOSE 80

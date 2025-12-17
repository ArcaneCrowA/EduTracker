# syntax=docker/dockerfile:1

FROM golang:1.25-alpine

WORKDIR /app

COPY . .

RUN go build -o /app/web main.go

EXPOSE 8081

CMD [ "/app/web" ]

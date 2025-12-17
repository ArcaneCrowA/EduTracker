# syntax=docker/dockerfile:1

FROM golang:1.25-alpine

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod tidy

COPY . .

RUN go build -o /app/server cmd/main.go

EXPOSE 8080

CMD [ "/app/server" ]

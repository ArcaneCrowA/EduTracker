FROM golang:1.25-alpine AS builder

ARG APP_NAME=app
ENV APP_NAME=${APP_NAME}
ENV GOOS=linux
ENV GOARCH=amd64

WORKDIR /app

COPY go.mod go.sum ./

RUN --mount=type=cache,target=/go/pkg/mod/ \
    go mod download

COPY . .

RUN CGO_ENABLED=0 go build \
    -ldflags="-s -w" \
    -o /${APP_NAME} \
    ./cmd/server/main.go

FROM alpine AS runtime
ENV APP_USER=appuser

RUN adduser -D -u 1000 ${APP_USER}

COPY --from=builder /app /app
COPY --from=builder /${APP_NAME} /${APP_NAME}

EXPOSE 8080

USER ${APP_USER}

ENTRYPOINT ["/app"]
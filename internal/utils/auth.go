package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte("my_secret_key")
var blacklist = make(map[string]bool)

type Claims struct {
	UserID uint
	jwt.RegisteredClaims
}

func GenerateToken(userID uint) (string, error) {
	expirationTime := time.Now().Add(3 * time.Hour)
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func ValidateToken(tokenString string) (*Claims, error) {

	if IsTokenBlacklisted(tokenString) {

		return nil, errors.New("token is blacklisted")

	}

	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {

		return jwtKey, nil

	})

	if err != nil {

		return nil, err

	}

	if !token.Valid {

		return nil, err

	}

	return claims, nil

}

func BlacklistToken(tokenString string) {

	blacklist[tokenString] = true

}

func IsTokenBlacklisted(tokenString string) bool {

	return blacklist[tokenString]

}

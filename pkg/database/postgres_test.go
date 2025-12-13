package database

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDSN(t *testing.T) {
	t.Run("generate gen from envs", func(t *testing.T) {
		restore := restoreENV(t)
		defer restore()
		assert.Nil(t, os.Setenv("DB_HOST", "test_host"))
		assert.Nil(t, os.Setenv("DB_NAME", "test_name"))
		assert.Nil(t, os.Setenv("DB_USER", "test_user"))
		assert.Nil(t, os.Setenv("DB_PASSWORD", "test_pass"))
		assert.Nil(t, os.Setenv("DB_PORT", "5432"))

		expectedDSN := "host=test_host user=test_user password=test_pass dbname=test_name port=5432 sslmode=disable TimeZone=Asia/Almaty"
		assert.Equal(t, expectedDSN, dsn_gen())
	})
}

func restoreENV(t testing.TB) func() {
	t.Helper()
	originalHost := os.Getenv("DB_HOST")
	originalName := os.Getenv("DB_NAME")
	originalUser := os.Getenv("DB_USER")
	originalPass := os.Getenv("DB_PASSWORD")
	originalPort := os.Getenv("DB_PORT")

	return func() {
		os.Setenv("DB_HOST", originalHost)
		os.Setenv("DB_NAME", originalName)
		os.Setenv("DB_USER", originalUser)
		os.Setenv("DB_PASSWORD", originalPass)
		os.Setenv("DB_PORT", originalPort)
	}
}

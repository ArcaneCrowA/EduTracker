package database

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
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

func TestGetDB(t *testing.T) {
	t.Run("returns the initialized db instance", func(t *testing.T) {
		originalDB := db
		defer func() {
			db = originalDB
		}()
		dummyDB := &gorm.DB{}
		db = dummyDB
		retrievedDB := GetDB()
		assert.NotNil(t, retrievedDB, "GetDB should return a non nil *gorm.DB instance")
		assert.Equal(t, dummyDB, retrievedDB, "GetDB should return the same *gorm.DB instance that was set")
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
		assert.NoError(t, os.Setenv("DB_HOST", originalHost))
		assert.NoError(t, os.Setenv("DB_NAME", originalName))
		assert.NoError(t, os.Setenv("DB_USER", originalUser))
		assert.NoError(t, os.Setenv("DB_PASSWORD", originalPass))
		assert.NoError(t, os.Setenv("DB_PORT", originalPort))
	}
}

package database_test

import (
	"os"
	"testing"

	"github.com/arcanecrowa/EduTracker/internal/models"
	"github.com/arcanecrowa/EduTracker/pkg/database"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
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
		assert.Equal(t, expectedDSN, database.Dsn_gen())
	})
}

func TestInitDB(t *testing.T) {
	t.Run("initialize db", func(t *testing.T) {
		sqliteDialector := sqlite.Open("file::memory:?cache=shared")
		db, err := database.InitDB(sqliteDialector)
		if err != nil {
			t.Fatalf("InitDB failed unexpectedly: %v", err)
		}
		if db == nil {
			t.Fatal("InitDB returned a nil database object on success")
		}
		if !db.Migrator().HasTable(&models.User{}) {
			t.Error("Migration verification failed: 'courses' table not found.")
		}
	})
	t.Run("failing dsn", func(t *testing.T) {
		failingDSN := "user=bad password=bad dbname=none port=123 host=127.0.0.1"
		failingDialector := postgres.Open(failingDSN)
		_, err := database.InitDB(failingDialector)
		if err == nil {
			t.Fatal("Expected InitDB to fail, but it succeeded.")
		}
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

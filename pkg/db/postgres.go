package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/arcanecrowa/EduTracker/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB
var Ctx context.Context

func InitDB() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	port := os.Getenv("DB_PORT")
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=edutracker port=%s sslmode=disable TimeZone=Asia/Almaty", host, user, password, port)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %s", err)
	}
	DB = db

	Ctx = context.Background()

	log.Println("Database connection successful. Running migrations")
	err = db.AutoMigrate(&models.Course{}, &models.Enrollment{}, &models.User{})
	if err != nil {
		log.Fatalf("Migrations failed: %s", err)
	}
	log.Println("Migrations successfully applied")
}

func GetDB() *gorm.DB {
	return DB
}

package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/arcanecrowa/EduTracker/internal/models"
	"gorm.io/gorm"
)

var Ctx = context.Background()

func InitDB(dialector gorm.Dialector) (*gorm.DB, error) {
	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, err
	}

	log.Println("Database connection successful. Running migrations")
	err = db.AutoMigrate(&models.Course{}, &models.Attendance{}, &models.User{})
	if err != nil {
		return nil, err
	}
	log.Println("Migrations successfully applied")
	return db, nil
}

func Dsn_gen() string {
	host := os.Getenv("DB_HOST")
	db_name := os.Getenv("DB_NAME")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	port := os.Getenv("DB_PORT")

	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Almaty", host, user, password, db_name, port)
}

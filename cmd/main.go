package main

import (
	"fmt"
	"log"

	"github.com/arcanecrowa/EduTracker/internal/routes"
	"github.com/arcanecrowa/EduTracker/pkg/database"
	"gorm.io/driver/postgres"
)

func main() {
	db, err := database.InitDB(postgres.Open(database.Dsn_gen()))
	if err != nil {
		fmt.Errorf("couldn't connect to database %v", err)
	}
	r := routes.SetupRouter()
	log.Fatal(r.Run(":8080"))
}

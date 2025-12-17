package main

import (
	"log"

	"github.com/arcanecrowa/EduTracker/internal/routes"
	"github.com/arcanecrowa/EduTracker/pkg/database"
	"gorm.io/driver/postgres"
)

func main() {
	database.InitDB(postgres.Open(database.Dsn_gen()))
	r := routes.SetupRouter()
	log.Fatal(r.Run(":8080"))
}

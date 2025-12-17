// @title Example API
// @version 1.0
// @description API
// @host localhost:8080
// @BasePath /api/v1
package main

import (
	"log"

	_ "github.com/arcanecrowa/EduTracker/docs"

	"github.com/arcanecrowa/EduTracker/internal/routes"
	"github.com/arcanecrowa/EduTracker/pkg/database"
	"gorm.io/driver/postgres"
)

func main() {
	db, err := database.InitDB(postgres.Open(database.Dsn_gen()))
	if err != nil {
		log.Fatalf("couldn't connect to database %v", err)
	}
	r := routes.SetupRouter(db)
	log.Fatal(r.Run(":8080"))
}

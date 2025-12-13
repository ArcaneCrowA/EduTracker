package main

import (
	"log"

	"github.com/arcanecrowa/EduTracker/internal/routes"
	"github.com/arcanecrowa/EduTracker/pkg/database"
)

func main() {
	database.InitDB()
	r := routes.SetupRouter()
	log.Fatal(r.Run(":8080"))
}

package main

import (
	"log"

	"github.com/arcanecrowa/EduTracker/internal/routes"
	database "github.com/arcanecrowa/EduTracker/pkg/db"
)

func main() {
	database.InitDB()
	r := routes.SetupRouter()
	log.Fatal(r.Run(":8080"))
}

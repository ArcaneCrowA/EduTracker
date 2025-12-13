package main

import (
	"github.com/arcanecrowa/EduTracker/internal/routes"
	database "github.com/arcanecrowa/EduTracker/pkg/db"
)

func main() {
	database.InitDB()
	r := routes.SetupRouter()
	r.Run(":8080")
}

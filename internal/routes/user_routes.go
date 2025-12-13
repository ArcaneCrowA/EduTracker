package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/arcanecrowa/EduTracker/internal/handlers"
)

func UserRoutes(rg *gin.RouterGroup) {
	users := rg.Group("/users")
	{
		users.GET("/:id", handlers.GetUser)
		users.PUT("/:id", handlers.UpdateUser)
	}
}

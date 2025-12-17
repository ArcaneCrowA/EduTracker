package routes

import (
	"github.com/arcanecrowa/EduTracker/internal/handlers"
	"github.com/gin-gonic/gin"
)

func UserRoutes(rg *gin.RouterGroup, userHandler *handlers.UserHandler) {
	users := rg.Group("/users")
	{
		users.POST("", userHandler.CreateUser)
		users.GET("/me", userHandler.GetMe)
		users.GET("/:id", userHandler.GetUser)
		users.GET("", userHandler.GetAllUsers)
		users.PUT("/:id", userHandler.UpdateUser)
		users.DELETE("/:id", userHandler.DeleteUser)

		users.GET("/:id/courses", userHandler.GetUserCourses)
		users.GET("/:id/attendances", userHandler.GetUserAttendances)
	}
}

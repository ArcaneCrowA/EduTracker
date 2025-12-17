package routes

import (
	"github.com/arcanecrowa/EduTracker/internal/handlers"
	"github.com/gin-gonic/gin"
)

func CourseRoutes(rg *gin.RouterGroup, courseHandler *handlers.CourseHandler) {
	courses := rg.Group("/courses")
	{
		courses.POST("", courseHandler.CreateCourse)
		courses.GET("/:id", courseHandler.GetCourse)
		courses.GET("", courseHandler.GetAllCourses)
		courses.PUT("/:id", courseHandler.UpdateCourse)
		courses.DELETE("/:id", courseHandler.DeleteCourse)
	}
}

package routes

import (
	"github.com/arcanecrowa/EduTracker/internal/handlers"
	"github.com/gin-gonic/gin"
)

func EnrollmentRoutes(rg *gin.RouterGroup, enrollmentHandler *handlers.EnrollmentHandler) {
	enrollments := rg.Group("/enrollments")
	{
		enrollments.POST("/enroll", enrollmentHandler.Enroll)
		enrollments.GET("/courses/:id", enrollmentHandler.GetEnrollmentsByCourseID)
		enrollments.GET("/users/:id", enrollmentHandler.GetEnrollmentsByUserID)
		enrollments.DELETE("/unenroll/user/:userId/course/:courseId", enrollmentHandler.Unenroll)
	}
}

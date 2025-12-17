package routes

import (
	"github.com/arcanecrowa/EduTracker/internal/handlers"
	"github.com/gin-gonic/gin"
)

func AttendanceRoutes(rg *gin.RouterGroup, attendanceHandler *handlers.AttendanceHandler) {
	attendance := rg.Group("/attendance")
	{
		attendance.POST("/enroll", attendanceHandler.Enroll)
		attendance.GET("/courses/:id", attendanceHandler.GetEnrollmentsByCourseID)
		attendance.GET("/users/:id", attendanceHandler.GetEnrollmentsByUserID)
		attendance.DELETE("/unenroll/user/:userId/course/:courseId", attendanceHandler.Unenroll)
	}
}

package routes

import (
	"github.com/arcanecrowa/EduTracker/internal/handlers"
	"github.com/gin-gonic/gin"
)

func AttendanceRoutes(rg *gin.RouterGroup, attendanceHandler *handlers.AttendanceHandler) {
	attendances := rg.Group("/attendances")
	{
		attendances.GET("", attendanceHandler.GetAllAttendances)
		attendances.POST("/mark", attendanceHandler.MarkAttendance)
		attendances.GET("/courses/:id", attendanceHandler.GetAttendancesByCourseID)
		attendances.GET("/users/:id", attendanceHandler.GetAttendancesByUserID)
		attendances.DELETE("/remove/user/:userId/course/:courseId", attendanceHandler.RemoveAttendance)
	}
}

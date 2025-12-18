package handlers

import (
	"strconv"

	"github.com/arcanecrowa/EduTracker/internal/models"
	"github.com/arcanecrowa/EduTracker/internal/repository"
	"github.com/gin-gonic/gin"
)

type AttendanceHandler struct {
	AttendanceRepo *repository.AttendanceRepository
}

func NewAttendanceHandler(repo *repository.AttendanceRepository) *AttendanceHandler {
	return &AttendanceHandler{AttendanceRepo: repo}
}

func (h *AttendanceHandler) MarkAttendance(c *gin.Context) {
	var attendance models.Attendance
	if err := c.ShouldBindJSON(&attendance); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// allow: admin or the user themselves
	isAdminVal, _ := c.Get("isAdmin")
	userIDVal, _ := c.Get("userID")
	isAdmin, _ := isAdminVal.(bool)
	requestUserID, _ := userIDVal.(uint)

	if !isAdmin && requestUserID != attendance.UserID {
		c.JSON(403, gin.H{"error": "cannot mark attendance for other users"})
		return
	}
	createdAttendance, err := h.AttendanceRepo.CreateAttendance(&attendance)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, createdAttendance)
}

func (h *AttendanceHandler) GetAttendancesByCourseID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course id"})
		return
	}

	// only admins can view attendances by course
	isAdmin, _ := c.Get("isAdmin")
	if isAdminBool, ok := isAdmin.(bool); !ok || !isAdminBool {
		c.JSON(403, gin.H{"error": "admin privileges required"})
		return
	}
	attendances, err := h.AttendanceRepo.GetAttendancesByCourseID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, attendances)
}

func (h *AttendanceHandler) GetAttendancesByUserID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}

	// allow: admin or the user themselves
	isAdminVal, _ := c.Get("isAdmin")
	userIDVal, _ := c.Get("userID")
	isAdmin, _ := isAdminVal.(bool)
	requestUserID, _ := userIDVal.(uint)

	if !isAdmin && requestUserID != uint(id) {
		c.JSON(403, gin.H{"error": "access denied"})
		return
	}
	attendances, err := h.AttendanceRepo.GetAttendancesByUserID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, attendances)
}

func (h *AttendanceHandler) GetAllAttendances(c *gin.Context) {
	isAdmin, _ := c.Get("isAdmin")
	if isAdminBool, ok := isAdmin.(bool); !ok || !isAdminBool {
		c.JSON(403, gin.H{"error": "admin privileges required"})
		return
	}

	attendances, err := h.AttendanceRepo.GetAllAttendancesWithDetails()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, attendances)
}

func (h *AttendanceHandler) RemoveAttendance(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}
	courseID, err := strconv.Atoi(c.Param("courseId"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course id"})
		return
	}

	// allow: admin or the user themselves
	isAdminVal, _ := c.Get("isAdmin")
	requestUserIDVal, _ := c.Get("userID")
	isAdmin, _ := isAdminVal.(bool)
	requestUserID, _ := requestUserIDVal.(uint)

	if !isAdmin && requestUserID != uint(userID) {
		c.JSON(403, gin.H{"error": "cannot remove attendance for other users"})
		return
	}
	if err := h.AttendanceRepo.DeleteAttendance(uint(userID), uint(courseID)); err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

package handlers

import (
	"strconv"

	"github.com/arcanecrowa/EduTracker/internal/models"
	"github.com/arcanecrowa/EduTracker/internal/repository"
	"github.com/gin-gonic/gin"
)

type EnrollmentHandler struct {
	EnrollmentRepo *repository.EnrollmentRepository
}

func NewEnrollmentHandler(repo *repository.EnrollmentRepository) *EnrollmentHandler {
	return &EnrollmentHandler{EnrollmentRepo: repo}
}

func (h *EnrollmentHandler) Enroll(c *gin.Context) {
	var enrollment models.Enrollment
	if err := c.ShouldBindJSON(&enrollment); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// allow: admin or the user enrolling themselves
	isAdminVal, _ := c.Get("isAdmin")
	userIDVal, _ := c.Get("userID")
	isAdmin, _ := isAdminVal.(bool)
	requestUserID, _ := userIDVal.(uint)

	if !isAdmin && requestUserID != enrollment.UserID {
		c.JSON(403, gin.H{"error": "cannot enroll other users"})
		return
	}
	createdEnrollment, err := h.EnrollmentRepo.CreateEnrollment(&enrollment)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, createdEnrollment)
}

func (h *EnrollmentHandler) GetEnrollmentsByCourseID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course id"})
		return
	}

	// only admins can view enrollments by course (attendance-like info)
	isAdmin, _ := c.Get("isAdmin")
	if isAdminBool, ok := isAdmin.(bool); !ok || !isAdminBool {
		c.JSON(403, gin.H{"error": "admin privileges required"})
		return
	}
	enrollments, err := h.EnrollmentRepo.GetEnrollmentsByCourseID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, enrollments)
}

func (h *EnrollmentHandler) GetEnrollmentsByUserID(c *gin.Context) {
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
	enrollments, err := h.EnrollmentRepo.GetEnrollmentsByUserID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, enrollments)
}

func (h *EnrollmentHandler) Unenroll(c *gin.Context) {
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
		c.JSON(403, gin.H{"error": "cannot unenroll other users"})
		return
	}
	if err := h.EnrollmentRepo.DeleteEnrollment(uint(userID), uint(courseID)); err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

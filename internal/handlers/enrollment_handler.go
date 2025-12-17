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
	if err := h.EnrollmentRepo.DeleteEnrollment(uint(userID), uint(courseID)); err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

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

// @Summary Enroll a user in a course
// @Description Enroll a user in a course with the input payload
// @Tags enrollments
// @Accept  json
// @Produce  json
// @Param enrollment body models.Enrollment true "Enrollment"
// @Success 201 {object} models.Enrollment
// @Router /enrollments/enroll [post]
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

// @Summary Get enrollments by course ID
// @Description Get all enrollments for a course
// @Tags enrollments
// @Produce  json
// @Param id path int true "Course ID"
// @Success 200 {array} models.Enrollment
// @Router /enrollments/courses/{id} [get]
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

// @Summary Get enrollments by user ID
// @Description Get all enrollments for a user
// @Tags enrollments
// @Produce  json
// @Param id path int true "User ID"
// @Success 200 {array} models.Enrollment
// @Router /enrollments/users/{id} [get]
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

// @Summary Unenroll a user from a course
// @Description Unenroll a user from a course by their IDs
// @Tags enrollments
// @Param userId path int true "User ID"
// @Param courseId path int true "Course ID"
// @Success 204
// @Router /enrollments/unenroll/user/{userId}/course/{courseId} [delete]
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

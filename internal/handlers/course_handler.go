package handlers

import (
	"strconv"

	"github.com/arcanecrowa/EduTracker/internal/models"
	"github.com/arcanecrowa/EduTracker/internal/repository"
	"github.com/gin-gonic/gin"
)

type CourseHandler struct {
	CourseRepo *repository.CourseRepository
}

func NewCourseHandler(repo *repository.CourseRepository) *CourseHandler {
	return &CourseHandler{CourseRepo: repo}
}

func (h *CourseHandler) CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	createdCourse, err := h.CourseRepo.CreateCourse(&course)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, createdCourse)
}

func (h *CourseHandler) GetCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course id"})
		return
	}
	course, err := h.CourseRepo.GetCourse(id)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, course)
}

func (h *CourseHandler) GetAllCourses(c *gin.Context) {
	courses, err := h.CourseRepo.GetAllCourses()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, courses)
}

func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course id"})
		return
	}
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	course.ID = uint(id)
	updatedCourse, err := h.CourseRepo.UpdateCourse(&course)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, updatedCourse)
}

func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid course id"})
		return
	}
	if err := h.CourseRepo.DeleteCourse(id); err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

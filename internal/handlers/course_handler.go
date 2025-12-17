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

// @Summary Create a new course
// @Description Create a new course with the input payload
// @Tags courses
// @Accept  json
// @Produce  json
// @Param course body models.Course true "Course"
// @Success 201 {object} models.Course
// @Router /courses [post]
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

// @Summary Get a course by ID
// @Description Get a course by its ID
// @Tags courses
// @Produce  json
// @Param id path int true "Course ID"
// @Success 200 {object} models.Course
// @Router /courses/{id} [get]
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

// @Summary Get all courses
// @Description Get a list of all courses
// @Tags courses
// @Produce  json
// @Success 200 {array} models.Course
// @Router /courses [get]
func (h *CourseHandler) GetAllCourses(c *gin.Context) {
	courses, err := h.CourseRepo.GetAllCourses()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, courses)
}

// @Summary Update a course
// @Description Update a course with the input payload
// @Tags courses
// @Accept  json
// @Produce  json
// @Param id path int true "Course ID"
// @Param course body models.Course true "Course"
// @Success 200 {object} models.Course
// @Router /courses/{id} [put]
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

// @Summary Delete a course
// @Description Delete a course by its ID
// @Tags courses
// @Param id path int true "Course ID"
// @Success 204
// @Router /courses/{id} [delete]
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

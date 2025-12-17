package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/arcanecrowa/EduTracker/internal/models"
	"github.com/arcanecrowa/EduTracker/internal/repository"
	"github.com/arcanecrowa/EduTracker/internal/utils"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	UserRepo *repository.UserRepository
}

func NewUserHandler(repo *repository.UserRepository) *UserHandler {
	return &UserHandler{UserRepo: repo}
}

// @Summary Create a new user
// @Description Create a new user with the input payload
// @Tags users
// @Accept  json
// @Produce  json
// @Param user body models.User true "User"
// @Success 201 {object} models.User
// @Router /users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	createdUser, err := h.UserRepo.CreateUser(&user)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, createdUser)
}

// @Summary Get current user
// @Description Get the currently logged in user
// @Tags users
// @Produce  json
// @Success 200 {object} models.User
// @Router /users/me [get]
func (h *UserHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	user, err := h.UserRepo.GetUser(int(userID.(uint)))
	if err != nil {
		c.JSON(404, gin.H{"error": "user not found"})
		return
	}
	c.JSON(200, user)
}

// @Summary Get a user by ID
// @Description Get a user by their ID
// @Tags users
// @Produce  json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}
	user, err := h.UserRepo.GetUser(id)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, user)
}

// @Summary Get all users
// @Description Get a list of all users
// @Tags users
// @Produce  json
// @Success 200 {array} models.User
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.UserRepo.GetAllUsers()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, users)
}

// @Summary Update a user
// @Description Update a user with the input payload
// @Tags users
// @Accept  json
// @Produce  json
// @Param id path int true "User ID"
// @Param user body models.User true "User"
// @Success 200 {object} models.User
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	user.ID = uint(id)
	updatedUser, err := h.UserRepo.UpdateUser(&user)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, updatedUser)
}

// @Summary Delete a user
// @Description Delete a user by their ID
// @Tags users
// @Param id path int true "User ID"
// @Success 204
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}
	if err := h.UserRepo.DeleteUser(id); err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

// @Summary Get user courses
// @Description Get all courses for a user
// @Tags users
// @Produce  json
// @Param id path int true "User ID"
// @Success 200 {array} models.Course
// @Router /users/{id}/courses [get]
func (h *UserHandler) GetUserCourses(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}

	courses, err := h.UserRepo.GetUserCourses(id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, courses)
}

// @Summary Get user attendances
// @Description Get all attendances for a user
// @Tags users
// @Produce  json
// @Param id path int true "User ID"
// @Success 200 {array} models.Enrollment
// @Router /users/{id}/attendances [get]
func (h *UserHandler) GetUserAttendances(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return
	}

	attendances, err := h.UserRepo.GetUserAttendances(id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, attendances)
}

// Login godoc
// @Summary Login a user
// @Description Login a user with login and password
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body utils.LoginRequest true "Credentials"
// @Success 200 {object} utils.LoginResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /public/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var loginData utils.LoginRequest
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	user, err := h.UserRepo.GetUserByLogin(loginData.Login)
	if err != nil || user.Password != loginData.Password {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{
			Error: "invalid credentials",
		})
		return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{
			Error: "could not generate token",
		})
		return
	}

	c.JSON(http.StatusOK, utils.LoginResponse{
		Token: token,
		User:  user,
	})
}

// @Summary Logout a user
// @Description Logout a user by blacklisting their token
// @Tags auth
// @Success 200 {object} gin.H{"message": "string"}
// @Router /logout [post]
func (h *UserHandler) Logout(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(400, gin.H{"error": "authorization header required"})
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(400, gin.H{"error": "invalid authorization header"})
		return
	}

	utils.BlacklistToken(parts[1])
	c.JSON(200, gin.H{"message": "logout successful"})
}

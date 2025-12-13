package handlers

import (
	"github.com/arcanecrowa/EduTracker/internal/models"
	"github.com/arcanecrowa/EduTracker/internal/repository"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	UserRepo *repository.UserRepository
}

func NewUserHandler(repo *repository.UserRepository) *UserHandler {
	return &UserHandler{UserRepo: repo}
}

func (h *UserHandler) GetUser(c *gin.Context) {
	var user models.User
	c.JSON(200, user)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	var user models.User
	c.JSON(200, user)
}

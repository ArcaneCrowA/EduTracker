package routes

import (
	"strings"

	"github.com/arcanecrowa/EduTracker/internal/handlers"
	"github.com/arcanecrowa/EduTracker/internal/repository"
	"github.com/arcanecrowa/EduTracker/internal/utils"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	// Initialize repository and handler
	userRepo := repository.NewUserRepository()
	userHandler := handlers.NewUserHandler(userRepo)

	api := router.Group("/api/v1")
	{
		// Public routes
		public := api.Group("/public")
		{
			public.POST("/login", userHandler.Login)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(AuthMiddleware())
		{
			UserRoutes(protected, userHandler)
			protected.POST("/logout", userHandler.Logout)
		}
	}
	return router
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "authorization header required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(401, gin.H{"error": "invalid authorization header"})
			return
		}

		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "invalid token"})
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}

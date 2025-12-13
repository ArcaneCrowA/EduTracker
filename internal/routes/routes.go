package routes

import "github.com/gin-gonic/gin"

func SetupRouter() *gin.Engine {
	router := gin.Default()

	public := router.Group("/api/v1")
	{
		public.POST("/login")
	}

	api := router.Group("/api/v1")
	{
		api.Use()
		UserRoutes(api)
	}
	return router
}

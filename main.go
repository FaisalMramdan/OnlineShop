package main

import (
	"Online_shop_api/db"
	"Online_shop_api/handlers"
	"Online_shop_api/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	db.ConnectMySQL()

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// =====================
	// AUTH (PUBLIC)
	// =====================
	r.POST("/register", handlers.Register)
	r.POST("/login", handlers.Login)

	//Fitur Admin
	admin := r.Group("/admin")
	admin.Use(middleware.JWTAuth(), middleware.AdminOnly())
	{
		// categories
		admin.POST("/categories", handlers.CreateCategory)
		admin.GET("/categories", handlers.GetCategories)
		admin.PUT("/categories/:id", handlers.UpdateCategories)
		admin.DELETE("/categories/:id", handlers.DeleteCategories)

		// products
		admin.POST("/products", handlers.CreateProduct)
		admin.GET("/products", handlers.GetProducts)
		admin.PUT("/products/:id", handlers.UpdateProducts)
		admin.DELETE("/products/:id", handlers.DeleteProducts)
	}

	r.Run(":8080")
}

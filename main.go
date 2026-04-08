package main

import (
	"Online_shop_api/db"
	"Online_shop_api/handlers"
	"Online_shop_api/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	godotenv.Load()

	db.ConnectMySQL()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Alamat port Vite React kamu
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})
	// PUBLIC (TIDAK PERLU LOGIN)
	
	r.GET("/products", handlers.GetProducts)
	r.GET("/categories", handlers.GetCategories)
	r.POST("/register", handlers.Register)
	r.POST("/login", handlers.Login)

	user := r.Group("/user")
	user.Use(middleware.JWTAuth())
	{
		// Pastikan di bawah rute yang butuh login (JWTAuth)
		r.POST("/api/checkout", handlers.Checkout)
		r.POST("/webhook/xendit", handlers.XenditWebhook)

		user.POST("/cart", handlers.AddToCart)
		user.GET("/cart", handlers.GetCart)
		user.PUT("/cart/:product_id", handlers.UpdateCartItem)
		user.DELETE("/cart/:product_id", handlers.DeleteCartItem)
		user.DELETE("/cart", handlers.ClearCart)
		user.POST("/pay/:order_id", handlers.CreateInvoice)
		user.POST("/checkout", handlers.Checkout)
	}

	admin := r.Group("/admin")
	admin.Use(middleware.JWTAuth(), middleware.AdminOnly())
	{
		admin.POST("/categories", handlers.CreateCategory)
		admin.GET("/categories", handlers.GetCategories)
		admin.PUT("/categories/:id", handlers.UpdateCategories)
		admin.DELETE("/categories/:id", handlers.DeleteCategories)

		// Pastikan di bawah middleware admin
		admin.GET("/summary", handlers.GetSummary)
		admin.GET("/order-stats", handlers.GetOrderStats)
		admin.GET("/orders", handlers.GetOrders)
		admin.PUT("/orders/:id", handlers.UpdateOrderStatus)
		admin.POST("/products", handlers.CreateProduct)
		admin.GET("/products", handlers.GetProducts)
		admin.PUT("/products/:id", handlers.UpdateProducts)
		admin.DELETE("/products/:id", handlers.DeleteProducts)
	}

	r.Run(":8080")
}

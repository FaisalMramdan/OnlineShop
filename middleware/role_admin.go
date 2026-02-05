package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")

		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "Akses khusus admin",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

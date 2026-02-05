package handlers

import (
	"Online_shop_api/db"
	"Online_shop_api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CREATE PRODUCT
func CreateProduct(c *gin.Context) {
	var input models.ProductInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(
		`INSERT INTO products
		(category_id, name, price, stock, description, image)
		VALUES (?, ?, ?, ?, ?, ?)`,
		input.CategoryID,
		input.Name,
		input.Price,
		input.Stock,
		input.Description,
		input.Image,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product berhasil ditambahkan",
	})
}

// GET ALL PRODUCTS
func GetProducts(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT p.id, p.name, p.price, p.stock, c.name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
	`)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var products []gin.H
	for rows.Next() {
		var id, stock int
		var name, category string
		var price float64

		if err := rows.Scan(&id, &name, &price, &stock, &category); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		products = append(products, gin.H{
			"id":       id,
			"name":     name,
			"price":    price,
			"stock":    stock,
			"category": category,
		})
	}
	c.JSON(200, products)
}

// UPDATE PRODUCT
func UpdateProducts(c *gin.Context) {
	id := c.Param("id")
	var input models.ProductInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.DB.Exec(
		`UPDATE products 
		 SET name=?, price=?, category_id=? 
		 WHERE id=?`,
		input.Name, input.Price, input.CategoryID, id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated"})
}

// DELETE PRODUCT
func DeleteProducts(c *gin.Context) {
	id := c.Param("id")

	result, err := db.DB.Exec(
		"DELETE FROM products WHERE id=?",
		id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
}

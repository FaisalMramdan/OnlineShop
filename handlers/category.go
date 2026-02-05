package handlers

import (
	"Online_shop_api/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateCategory(c *gin.Context) {
	var input struct {
		Name string `json:"name"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(
		"INSERT INTO categories (name) VALUES (?)",
		input.Name,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Category berhasil"})
}

func GetCategories(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, name FROM categories")
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var result []gin.H
	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		result = append(result, gin.H{
			"id":   id,
			"name": name,
		})
	}
	c.JSON(200, result)
}
func UpdateCategories(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Name string `json:"name"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.DB.Exec(
		"UPDATE categories SET name=? WHERE id=?",
		input.Name, id,
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
		c.JSON(http.StatusNotFound, gin.H{"message": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category updated"})
}

// DELETE CATEGORY
func DeleteCategories(c *gin.Context) {
	id := c.Param("id")

	result, err := db.DB.Exec(
		"DELETE FROM categories WHERE id=?",
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
		c.JSON(http.StatusNotFound, gin.H{"message": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}

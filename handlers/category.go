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

	// Mulai transaksi
	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memulai transaksi"})
		return
	}

	// 1. Hapus cart items yang punya produk dari kategori ini
	_, err = tx.Exec(`
		DELETE FROM carts WHERE product_id IN (
			SELECT id FROM products WHERE category_id = ?
		)`, id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus keranjang terkait: " + err.Error()})
		return
	}

	// 2. Hapus order_items yang punya produk dari kategori ini
	_, err = tx.Exec(`
		DELETE FROM order_items WHERE product_id IN (
			SELECT id FROM products WHERE category_id = ?
		)`, id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus order items terkait: " + err.Error()})
		return
	}

	// 3. Hapus produk-produk dalam kategori ini
	_, err = tx.Exec("DELETE FROM products WHERE category_id = ?", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus produk terkait: " + err.Error()})
		return
	}

	// 4. Hapus kategorinya
	result, err := tx.Exec("DELETE FROM categories WHERE id = ?", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus kategori: " + err.Error()})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"message": "Kategori tidak ditemukan"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}

package handlers

import (
	"Online_shop_api/db"
	"Online_shop_api/models"
	"net/http"
	"strconv"
	"time"

	"database/sql"

	"github.com/gin-gonic/gin"
)

func CreateProduct(c *gin.Context) {
	// 1. Ambil input teks dan angka
	name := c.PostForm("name")
	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	price, _ := strconv.ParseFloat(c.PostForm("price"), 64)
	stock, _ := strconv.Atoi(c.PostForm("stock"))
	description := c.PostForm("description")

	// 2. Handle File Gambar (Wajib sesuai soal Ujikom)
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gambar harus diupload"})
		return
	}

	// Nama file unik agar tidak bentrok
	filename := time.Now().Format("20060102150405") + "_" + file.Filename
	// Simpan ke folder 'uploads'
	if err := c.SaveUploadedFile(file, "uploads/"+filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan gambar"})
		return
	}

	// 3. Simpan ke Database
	_, err = db.DB.Exec(
		`INSERT INTO products (category_id, name, price, stock, description, image) 
         VALUES (?, ?, ?, ?, ?, ?)`,
		categoryID, name, price, stock, description, filename,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product berhasil ditambahkan"})
}

// GET ALL PRODUCTS
func GetProducts(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT p.id, p.name, p.price, p.stock, c.name, p.image
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
		var name, image string
		var category sql.NullString
		var price float64
		if err := rows.Scan(&id, &name, &price, &stock, &category, &image); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		products = append(products, gin.H{
			"id":       id,
			"name":     name,
			"price":    price,
			"stock":    stock,
			"category": category.String,
			"image":    image,
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

	// Mulai transaksi
	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memulai transaksi"})
		return
	}

	// 1. Hapus dari carts yang punya produk ini
	_, err = tx.Exec("DELETE FROM carts WHERE product_id = ?", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus dari keranjang: " + err.Error()})
		return
	}

	// 2. Hapus dari order_items yang punya produk ini
	_, err = tx.Exec("DELETE FROM order_items WHERE product_id = ?", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus dari order items: " + err.Error()})
		return
	}

	// 3. Hapus produknya
	result, err := tx.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hapus produk: " + err.Error()})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"message": "Produk tidak ditemukan"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}

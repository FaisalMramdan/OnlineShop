package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"Online_shop_api/db"

	"github.com/gin-gonic/gin"
)

type AddCartInput struct {
	ProductID int `json:"product_id" binding:"required"`
	Quantity  int `json:"quantity" binding:"required,min=1"`
}

type UpdateCartInput struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

/*
========================
ADD TO CART
========================
*/
func AddToCart(c *gin.Context) {
	var input AddCartInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := int(c.MustGet("user_id").(float64))

	var existingQty int
	// UBAH DISINI: cart_item -> carts, quantity -> qty
	err := db.DB.QueryRow(
		"SELECT qty FROM carts WHERE user_id = ? AND product_id = ?",
		userID, input.ProductID,
	).Scan(&existingQty)

	if err == sql.ErrNoRows {
		// UBAH DISINI
		_, err = db.DB.Exec(
			"INSERT INTO carts (user_id, product_id, qty) VALUES (?, ?, ?)",
			userID, input.ProductID, input.Quantity,
		)
	} else {
		// UBAH DISINI
		_, err = db.DB.Exec(
			"UPDATE carts SET qty = qty + ? WHERE user_id = ? AND product_id = ?",
			input.Quantity, userID, input.ProductID,
		)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product added to cart"})
}

/*
========================
GET CART
========================
*/
func GetCart(c *gin.Context) {
	userID := int(c.MustGet("user_id").(float64))

	// UBAH DISINI: cart_item -> carts, ci.quantity -> ci.qty
	rows, err := db.DB.Query(`
		SELECT ci.product_id, p.name, p.price, ci.qty, IFNULL(p.image, '')
		FROM carts ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = ?
	`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed get cart"})
		return
	}
	defer rows.Close()

	var item []gin.H
	var total float64

	for rows.Next() {
		var productID int
		var name string 
		var price float64
		var qty int
		var image string

		rows.Scan(&productID, &name, &price, &qty, &image)

		subtotal := price * float64(qty)
		total += subtotal

		item = append(item, gin.H{
			"product_id": productID,
			"name":       name,
			"price":      price,
			"quantity":   qty,
			"image":      image,
			"subtotal":   subtotal,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"item":  item,
		"total": total,
	})
}

/*
========================
UPDATE CART ITEM
========================
*/
func UpdateCartItem(c *gin.Context) {
	userID := int(c.MustGet("user_id").(float64))
	productIDParam := c.Param("product_id")

	productID, err := strconv.Atoi(productIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var input UpdateCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// UBAH DISINI: cart_item -> carts, quantity -> qty
	result, err := db.DB.Exec(
		"UPDATE carts SET qty = ? WHERE user_id = ? AND product_id = ?",
		input.Quantity, userID, productID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed update cart"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart updated"})
}

/*
========================
DELETE CART ITEM
========================
*/
func DeleteCartItem(c *gin.Context) {
	userID := int(c.MustGet("user_id").(float64))
	productIDParam := c.Param("product_id")

	productID, err := strconv.Atoi(productIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	// UBAH DISINI: cart_item -> carts
	result, err := db.DB.Exec(
		"DELETE FROM carts WHERE user_id = ? AND product_id = ?",
		userID, productID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed delete item"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "item removed"})
}

/*
========================
CLEAR CART
========================
*/
func ClearCart(c *gin.Context) {
	userID := int(c.MustGet("user_id").(float64))

	// UBAH DISINI: cart_item -> carts
	_, err := db.DB.Exec("DELETE FROM carts WHERE user_id = ?", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart cleared"})
}
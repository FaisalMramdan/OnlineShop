package handlers

import (
	"net/http"

	"Online_shop_api/db"

	"github.com/gin-gonic/gin"
)

func Checkout(c *gin.Context) {
	userID := int(c.MustGet("user_id").(float64))

	// ambil cart user
	// UBAH DISINI: cart_items -> carts, ci.quantity -> ci.qty
	rows, err := db.DB.Query(`
		SELECT ci.product_id, ci.qty, p.price
		FROM carts ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = ?
	`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed get cart"})
		return
	}
	defer rows.Close()

	var items []struct {
		ProductID int
		Qty       int
		Price     float64
	}

	var total float64

	for rows.Next() {
		var item struct {
			ProductID int
			Qty       int
			Price     float64
		}

		rows.Scan(&item.ProductID, &item.Qty, &item.Price)

		total += item.Price * float64(item.Qty)
		items = append(items, item)
	}

	// TAMBAHAN: Cek apakah keranjang kosong
	if len(items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cart is empty"})
		return
	}

	// insert order
	result, err := db.DB.Exec(
		"INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
		userID, total,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	orderID, _ := result.LastInsertId()

	// insert order items
	for _, item := range items {
		// Catatan: Pastikan di tabel 'order_items' nama kolomnya memang 'quantity' ya, bukan 'qty' juga.
		// Kalau di database namanya 'qty', silakan ubah kata 'quantity' di bawah ini menjadi 'qty'
		_, err := db.DB.Exec(
			"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
			orderID, item.ProductID, item.Qty, item.Price,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed insert order items"})
			return
		}
	}

	
	// clear cart
	// UBAH DISINI: cart_items -> carts
	db.DB.Exec("DELETE FROM carts WHERE user_id = ?", userID)

	c.JSON(http.StatusOK, gin.H{
		"message":  "checkout success",
		"order_id": orderID,
		"total":    total,
	})
}
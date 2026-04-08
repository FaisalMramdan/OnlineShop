package handlers

import (
	"Online_shop_api/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ==========================================
// 1. DASHBOARD SUMMARY (UNTUK ADMIN)
// ==========================================
func GetSummary(c *gin.Context) {
	var totalProducts int
	var totalOrders int
	var totalRevenue float64

	// total produk
	db.DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&totalProducts)

	// total orders
	db.DB.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalOrders)

	// total revenue
	db.DB.QueryRow("SELECT IFNULL(SUM(total_price),0) FROM orders WHERE status='paid'").Scan(&totalRevenue)

	c.JSON(200, gin.H{
		"total_products": totalProducts,
		"total_orders":   totalOrders,
		"total_revenue":  totalRevenue,
	})
}

// ==========================================
// 2. CHECKOUT (UNTUK CUSTOMER)
// ==========================================
func Checkout(c *gin.Context) {
	userID := int(c.MustGet("user_id").(float64))

	// Ambil data keranjang user (Join dengan products untuk dapat harga terbaru)
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

	// Cek apakah keranjang kosong
	if len(items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cart is empty"})
		return
	}

	// 1. Insert ke tabel orders
	result, err := db.DB.Exec(
		"INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
		userID, total,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	orderID, _ := result.LastInsertId()

	// 2. Insert detail ke tabel order_items
	for _, item := range items {
		_, err := db.DB.Exec(
			"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
			orderID, item.ProductID, item.Qty, item.Price,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed insert order items"})
			return
		}
	}

	// 3. Kosongkan keranjang setelah berhasil checkout
	db.DB.Exec("DELETE FROM carts WHERE user_id = ?", userID)

	c.JSON(http.StatusOK, gin.H{
		"message":  "checkout success",
		"order_id": orderID,
		"total":    total,
	})
}

// ==========================================
// 3. ORDER STATS (UNTUK ADMIN)
// ==========================================
func GetOrderStats(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT status, COUNT(*) as total
		FROM orders
		GROUP BY status
	`)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var result []gin.H

	for rows.Next() {
		var status string
		var total int

		rows.Scan(&status, &total)

		result = append(result, gin.H{
			"status": status,
			"total":  total,
		})
	}

	c.JSON(200, result)
}

// ==========================================
// 4. GET ALL ORDERS (UNTUK ADMIN)
// ==========================================
func GetOrders(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT o.id, u.name, o.total_price, o.status, o.created_at
		FROM orders o
		LEFT JOIN users u ON o.user_id = u.id
		ORDER BY o.id DESC
	`)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var orders []gin.H

	for rows.Next() {
		var id int
		var name string
		var total float64
		var status string
		var created string

		rows.Scan(&id, &name, &total, &status, &created)

		orders = append(orders, gin.H{
			"id":         id,
			"name":       name,
			"total":      total,
			"status":     status,
			"created_at": created,
		})
	}

	c.JSON(200, orders)
}

// ================= UPDATE STATUS ORDER =================
func UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(
		"UPDATE orders SET status=? WHERE id=?",
		input.Status, id,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"message": "Status berhasil diupdate",
	})
}

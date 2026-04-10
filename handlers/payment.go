package handlers

import (
	"Online_shop_api/db"
	"context"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/xendit/xendit-go/v6"
	invoice "github.com/xendit/xendit-go/v6/invoice"
)

func XenditWebhook(c *gin.Context) {
	var payload map[string]interface{}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(400, gin.H{"error": "Invalid payload"})
		return
	}

	fmt.Println("WEBHOOK MASUK:", payload)

	status := payload["status"].(string)
	externalID := payload["external_id"].(string)

	if status == "PAID" {
		// ambil order id dari external_id
		// contoh: "order-2"
		var orderID int
		fmt.Sscanf(externalID, "order-%d", &orderID)

		_, err := db.DB.Exec("UPDATE orders SET status = 'paid' WHERE id = ?", orderID)
		if err != nil {
			fmt.Println("DB ERROR:", err)
		}
	}

	c.JSON(200, gin.H{"message": "ok"})
}

func CreateInvoice(c *gin.Context) {
	orderID := c.Param("order_id")

	var total float64
	err := db.DB.QueryRow(
		"SELECT total_price FROM orders WHERE id = ?",
		orderID,
	).Scan(&total)

	if err != nil {
		c.JSON(500, gin.H{"error": "Order tidak ditemukan"})
		return
	}

	client := xendit.NewClient(os.Getenv("XENDIT_API_KEY"))

	ctx := context.Background()

	email := "test@gmail.com"
	desc := "Pembayaran Order #" + orderID
	successURL := "http://localhost:5173/"

	req := invoice.CreateInvoiceRequest{
		ExternalId:         "order-" + orderID,
		Amount:             total,
		PayerEmail:         &email,
		Description:        &desc,
		SuccessRedirectUrl: &successURL,
	}

	resp, _, err := client.InvoiceApi.CreateInvoice(ctx).
		CreateInvoiceRequest(req).
		Execute()

	fmt.Println("ERR:", err)
	fmt.Println("RESP:", resp)

	// VALIDASI BENAR
	if resp == nil {
		fmt.Println("RESP NIL → ERROR")

		c.JSON(500, gin.H{
			"error": "Gagal membuat invoice",
		})
		return
	}

	// SUCCESS
	c.JSON(200, gin.H{
		"invoice_url": resp.InvoiceUrl,
	})
}

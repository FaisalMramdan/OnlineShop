package models

import "time"

type Order struct {	
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	TotalPrice float64   `json:"total_price"`
	CreatedAt time.Time `json:"created_at"`
}

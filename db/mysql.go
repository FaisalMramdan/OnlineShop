package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func ConnectMySQL() {
	dsn := "root:@tcp(127.0.0.1:3306)/online_shop?parseTime=true"

	database, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Gagal koneksi ke database:", err)
	}

	err = database.Ping()
	if err != nil {
		log.Fatal("Database tidak bisa di-ping:", err)
	}

	DB = database
	fmt.Println(" MySQL Connected")
}


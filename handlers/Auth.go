package handlers

import (
	"Online_shop_api/db"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context) {
	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Input tidak valid",
		})
		return
	}

	// Cek email sudah ada atau belum
	var exists int
	err := db.DB.QueryRow(
		"SELECT COUNT(*) FROM users WHERE email = ?",
		input.Email,
	).Scan(&exists)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database error saat cek email",
		})
		return
	}

	if exists > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email sudah terdaftar",
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(input.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal hash password",
		})
		return
	}

	// PERBAIKAN: Menambahkan kolom 'role' dengan default value 'user'
	// Pastikan tabel users Anda memiliki kolom 'role'
	_, err = db.DB.Exec(
		"INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
		input.Name,
		input.Email,
		hashedPassword,
		"user", // Default role
	)

	if err != nil {
		// Print error asli ke terminal untuk debugging
		fmt.Println("Error Register:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal register ke database",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Register berhasil",
	})
}

func Login(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}

	var id int
	var role string
	var hashedPassword string

	err := db.DB.QueryRow(
		"SELECT id, role, password FROM users WHERE email = ?",
		input.Email,
	).Scan(&id, &role, &hashedPassword)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Email atau password salah"})
		return
	}

	if bcrypt.CompareHashAndPassword(
		[]byte(hashedPassword),
		[]byte(input.Password),
	) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Email atau password salah"})
		return
	}

	// === JWT ===
	claims := jwt.MapClaims{
		"user_id": id,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secret := []byte(os.Getenv("JWT_SECRET"))
	tokenString, err := token.SignedString(secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   tokenString,
		"role":    role,
	})
}

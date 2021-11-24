package app

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

// TODO:
func handleTest(c *gin.Context, userId string, email string) {
	fmt.Println("user id: " + userId)
	fmt.Println("email: " + email)

	toNoContent(c)
}

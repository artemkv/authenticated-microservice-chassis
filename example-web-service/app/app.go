package app

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"

	"artemkv.net/example/health"
	"artemkv.net/example/reststats"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(router *gin.Engine, allowedOrigin string) {
	// setup logger, recover
	router.Use(requestLogger(log.StandardLogger()))
	router.Use(gin.CustomRecovery(recover))

	// setup CORS
	allowedOrigins := strings.Split(allowedOrigin, ",")
	router.Use(cors.New(getCorsConfig(allowedOrigins)))

	// favicon
	router.StaticFile("/favicon.ico", "./resources/favicon.ico")

	// update stats
	router.Use(reststats.RequestCounter())

	// used for testing / health checks
	router.GET("/health", health.HandleHealthCheck)
	router.GET("/liveness", health.HandleLivenessCheck)
	router.GET("/readiness", health.HandleReadinessCheck)
	router.GET("/error", handleError)

	// stats
	router.GET("/stats", reststats.HandleEndpointWithStats(reststats.HandleGetStats))

	// sign-in
	router.POST("/signin", reststats.HandleEndpointWithStats(handleSignIn))

	// do business
	router.GET("/test", reststats.HandleEndpointWithStats(
		withAuthentication(handleTest)))

	// handle 404
	router.NoRoute(reststats.HandleWithStats(notFoundHandler()))
}

func getCorsConfig(allowedOrigins []string) cors.Config {
	return cors.Config{
		AllowOrigins:  allowedOrigins,
		AllowHeaders:  []string{"*"},
		AllowMethods:  []string{"*"},
		ExposeHeaders: []string{"*"},
	}
}

func toSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{"data": data})
}

func toCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{"data": data})
}

func toNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

func toUnauthorized(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, gin.H{"err": "Unauthorized"})
}

func toBadRequest(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, gin.H{"err": err.Error()})
}

func toNotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, gin.H{"err": "Not Found"})
}

func toInternalServerError(c *gin.Context, errText string) {
	// TODO: when too many internal server errors, set liveness to false and exit
	c.JSON(http.StatusInternalServerError, gin.H{"err": errText})
}

func recover(c *gin.Context, err interface{}) {
	if errText, ok := err.(string); ok {
		toInternalServerError(c, errText)
	}
	c.AbortWithStatus(http.StatusInternalServerError)

	reststats.UpdateResponseStatsOnRecover(
		time.Now(), c.Request.RequestURI, http.StatusInternalServerError)
}

func requestLogger(logger *log.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		message := fmt.Sprintf("%d %s %s",
			c.Writer.Status(),
			c.Request.Method,
			c.Request.URL.Path)

		logger.Info(message)
	}
}

func notFoundHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"err": "Not found"})
	}
}

func handleError(c *gin.Context) {
	panic("Test error")
}

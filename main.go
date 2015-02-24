package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/julienschmidt/httprouter"
)

var (
	port int
	cube CubeDb
)

func main() {
	c, d := parseCmdLine()
	cube = CreateCubeDb(c, d)

	router := httprouter.New()
	router.NotFound = http.FileServer(http.Dir("public")).ServeHTTP
	router.ServeFiles("/content/*filepath", http.Dir("public"))
	router.GET("/api/list/:name", tagList)

	r := http.Handler(router)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), logger(r)))
}

func logger(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s\n", r.URL.Path)
		h.ServeHTTP(w, r)
	})
}

func tagList(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	addHeaders(w, time.Hour)
	name := ps.ByName("name")
	if list, err := cube.DistinctItems(name); err == nil {
		log.Printf("Found %s : %d\n", ps.ByName("name"), len(list))
		ret, _ := json.Marshal(list)
		w.Header().Set("Content-Type", "application/json")
		w.Write(ret)
	} else {
		log.Printf("tagList Failed %s\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, err)
	}
}

func addHeaders(w http.ResponseWriter, expires time.Duration) {
	t := time.Now()
	head := w.Header()
	head.Set("Cache-Control", "public")
	head.Set("Last-Modified", t.Format(time.RFC1123))
	head.Set("Expires", t.Add(expires).Format(time.RFC1123))
}

func parseCmdLine() (conn, db string) {
	flag.StringVar(&conn, "conn", "mongodb://localhost:27017", "MongoDb connection string")
	flag.StringVar(&db, "db", "test-db", "MongoDb database name")
	flag.IntVar(&port, "port", 8123, "Web server port")
	help := flag.Bool("help", false, "show help")
	flag.Parse()

	if *help {
		flag.Usage()
		os.Exit(0)
		return "", ""
	}
	fmt.Printf("Connecting to %s\nDb %s\nListening on http://localhost:%d/api/list/collection_name\n", conn, db, port)
	return conn, db
}

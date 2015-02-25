package main

import (
	"fmt"
	"log"
	"strings"

	"gopkg.in/mgo.v2"
)

type CubeDb struct {
	Connection string
	Database   string
	Error      error
	session    *mgo.Session
	db         *mgo.Database
}

func CreateCubeDb(connection, database string) CubeDb {
	return CubeDb{Connection: connection, Database: database}
}

func (cube *CubeDb) Dial() error {
	cube.session, cube.Error = mgo.Dial(cube.Connection)
	if cube.Error != nil {
		log.Printf("Can't connect to mongo, go error %v\n", cube.Error)
		return cube.Error
	}
	cube.db = cube.session.DB(cube.Database)
	return nil
}

func (cube *CubeDb) Close() {
	if cube.session == nil {
		return
	}
	cube.session.Close()
}

func (cube *CubeDb) getMetricsList(collection string) ([]string, error) {
	var result []string

	log.Printf("Checking\nuse %s\ndb.%s.distinct('d.name')\n", cube.Database, collection)

	if col := cube.db.C(collection); col != nil {
		cube.Error = col.Find(nil).Distinct("d.name", &result)
	} else {
		cube.Error = fmt.Errorf("No collection found")
	}

	return result, cube.Error
}

func (cube *CubeDb) DistinctItems(collection string) ([]string, error) {
	if cube.Dial() != nil {
		return nil, cube.Error
	}
	defer cube.Close()

	return cube.getMetricsList(collection)
}

func (cube *CubeDb) Collections() ([]string, error) {
	if cube.Dial() != nil {
		return nil, cube.Error
	}
	defer cube.Close()
	var all []string

	if all, cube.Error = cube.db.CollectionNames(); cube.Error != nil {
		return nil, cube.Error
	}
	all = Where(all, func(s string) bool {
		return strings.HasSuffix(s, "_events")
	})
	Transform(all, func(s string) string {
		return strings.TrimSuffix(s, "_events")
	})
	return all, nil
}

package main

import (
	"fmt"
	"strings"
	"testing"
)

func Test_where(t *testing.T) {
	a := []string{"apple_event", "banana_event", "cherry", "a.index", "nearly_event", "_last"}
	b := Where(a, endsWith("_event"))
	fmt.Println(a)
	fmt.Println(b)

	t.Fail()
}

func endsWith(filter string) func(string) bool {
	return func(s string) bool {
		b := strings.HasSuffix(s, filter)
		//fmt.Printf("%s == %s => %v\n", s, filter, b)
		return b
	}
}

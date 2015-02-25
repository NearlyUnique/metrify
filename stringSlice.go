package main

func Where(list []string, filter func(string) bool) []string {
	for i := 0; i < len(list); i++ {
		if !filter(list[i]) {
			//fmt.Printf("- : %s\n1 : %v\n2 : %v\n", list[i], list[:i], list[i+1:])
			list = append(list[:i], list[i+1:]...)
			i--
		}
	}
	return list
}

func Transform(list []string, xform func(string) string) {
	for i := 0; i < len(list); i++ {
		list[i] = xform(list[i])
	}
}

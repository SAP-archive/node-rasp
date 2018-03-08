const char* tests[] = {
  "SELECT 1",
  "[ 0, 6, 597, 4 ]\n[ 7, 8, 264, 0 ]\n",
	"SELECT update AS left /* comment */ FROM between",
	"[ 0, 6, 597, 4 ]\n[ 7, 13, 663, 1 ]\n[ 14, 16, 290, 4 ]\n[ 17, 21, 474, 3 ]\n[ 36, 40, 417, 4 ]\n[ 41, 48, 302, 2 ]\n",
};

size_t testsLength = __LINE__ - 4;

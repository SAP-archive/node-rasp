const char* tests[] = {
  "SELECT 1",
  "[ 0, 6, 597, 4 ]\n[ 7, 8, 264, 0 ]\n",
  "SELECT 1 -- foobar",
  "[ 0, 6, 597, 4 ]\n[ 7, 8, 264, 0 ]\n[ 9, 18, 330, 1 ]\n",
	"SELECT update AS left /* comment */ FROM between",
	"[ 0, 6, 597, 4 ]\n[ 7, 13, 663, 1 ]\n[ 14, 16, 290, 4 ]\n[ 17, 21, 474, 3 ]\n[ 22, 24, 330, 1 ]\n[ 36, 40, 417, 4 ]\n[ 41, 48, 302, 2 ]\n",
};

size_t testsLength = __LINE__ - 4;

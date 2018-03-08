#include <pg_query.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#include "scan_tests.c"

#include "protobuf/scan_output.pb-c.h"

int main() {
  size_t i;
	size_t j;
  bool ret_code = 0;
	Pgquery__ScanOutput *scan_output;
	Pgquery__ScanToken *scan_token;
	PgQueryScanResult result;

  for (i = 0; i < testsLength; i += 2) {
		char buffer[1024];
		buffer[0] = '\0';

    result = pg_query_scan(tests[i]);

		if (result.error) {
			ret_code = -1;
			printf("%s\n", result.error->message);
		} else {
			scan_output = pgquery__scan_output__unpack(NULL, result.pbuf_len, result.pbuf);

      for (j = 0; j < scan_output->n_tokens; j++) {
				char buffer2[1024];
				scan_token = scan_output->tokens[j];
				sprintf(buffer2, "[ %d, %d, %d, %d ]\n", scan_token->start, scan_token->end, scan_token->token, scan_token->keyword_kind);
				strcat(buffer, buffer2);
			}

			pgquery__scan_output__free_unpacked(scan_output, NULL);

			if (strcmp(buffer, tests[i + 1]) == 0) {
	      printf(".");
	    } else {
	      ret_code = -1;
	      printf("INVALID result for \"%s\"\nexpected: %s\nactual: %s\n", tests[i], tests[i + 1], buffer);
			}
    }

    pg_query_free_scan_result(result);
  }

  printf("\n");

  return ret_code;
}

#include "node.h"
#include "v8.h"
#include "pg_query.h"

namespace node {

namespace pg { 

NODE_EXTERN bool HasInjection(v8::Isolate* isolate,
                              const char* data) {
  return false;
}

}  // namespace pg
}  // namespace node

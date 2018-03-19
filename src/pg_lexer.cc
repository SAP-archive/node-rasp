#include "node.h"
#include "v8.h"
#include "env.h"
#include "env-inl.h"
#include "async_wrap-inl.h"
#include "pg_query.h"
#include "protobuf/scan_output.pb-c.h"

namespace node {

namespace pg {

using v8::Array;
using v8::Context;
using v8::FunctionCallbackInfo;
using v8::Integer;
using v8::Local;
using v8::Object;
using v8::Value;

NODE_EXTERN Local<Array> HasInjection(Environment* env, const char* data) {
  PgQueryScanResult result;
  Pgquery__ScanOutput *scan_output;
  Pgquery__ScanToken *scan_token;
  size_t j;

  result = pg_query_scan(data);

  Local<Array> ranges;
  if (result.error) {
    ranges = Array::New(env->isolate(), 0);
    return ranges;
  } else {
    scan_output = pgquery__scan_output__unpack(NULL, result.pbuf_len,
                                  static_cast<uint8_t *>(result.pbuf));

    /*printf("  tokens: %ld, size: %d\n",
             scan_output->n_tokens, result.pbuf_len);*/
    ranges = Array::New(env->isolate(), scan_output->n_tokens);
    for (j = 0; j < scan_output->n_tokens; j++) {
      scan_token = scan_output->tokens[j];
      Local<Integer> range = Integer::New(env->isolate(), scan_token->start);
      ranges->Set(j, range);
      /*printf("  [ %d, %d, %d, %d ]\n",
             scan_token->start,
             scan_token->end,
             scan_token->token,
             scan_token->keyword_kind);*/
    }
    pgquery__scan_output__free_unpacked(scan_output, NULL);
  }
  pg_query_free_scan_result(result);
  return ranges;
}

void GetPostgresTokens(const FunctionCallbackInfo<Value>& args) {
  Environment* env = Environment::GetCurrent(args);
  const char* test = "SELECT foo FROM bar WHERE baz=42;";
  Local<Array> is = HasInjection(env, test);

  args.GetReturnValue().Set(is);
}

void Initialize(Local<Object> target,
                Local<Value> unused,
                Local<Context> context) {
  Environment* env = Environment::GetCurrent(context);
  env->SetMethod(target, "getTokens", GetPostgresTokens);
}

}  // namespace pg
}  // namespace node

NODE_BUILTIN_MODULE_CONTEXT_AWARE(pgi, node::pg::Initialize)

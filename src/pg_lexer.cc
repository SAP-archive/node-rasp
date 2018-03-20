#include "node.h"
#include "v8.h"
#include "env.h"
#include "env-inl.h"
#include "async_wrap-inl.h"
#include "pg_query.h"
#include "protobuf/scan_output.pb-c.h"

namespace node {

namespace pglexer {

using v8::Array;
using v8::Context;
using v8::FunctionCallbackInfo;
using v8::Integer;
using v8::Local;
using v8::Object;
using v8::String;
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
  } else {
    scan_output = pgquery__scan_output__unpack(NULL, result.pbuf_len,
                                  static_cast<uint8_t *>(result.pbuf));

    ranges = Array::New(env->isolate(), scan_output->n_tokens);
    Local<String> beginKey = String::NewFromUtf8(env->isolate(), "begin");
    Local<String> endKey = String::NewFromUtf8(env->isolate(), "end");
    Local<String> typeKey = String::NewFromUtf8(env->isolate(), "type");
    for (j = 0; j < scan_output->n_tokens; j++) {
      scan_token = scan_output->tokens[j];
      Local<Object> range = Object::New(env->isolate());
      CHECK(range->SetPrototype(env->context(),
                                Null(env->isolate())).FromJust());

      range->Set(beginKey, Integer::New(env->isolate(), scan_token->start));
      range->Set(endKey, Integer::New(env->isolate(), scan_token->end));
      range->Set(typeKey, Integer::New(env->isolate(),
                 scan_token->keyword_kind));

      ranges->Set(j, range);
    }
    pgquery__scan_output__free_unpacked(scan_output, NULL);
  }
  pg_query_free_scan_result(result);
  return ranges;
}

void GetPostgresTokens(const FunctionCallbackInfo<Value>& args) {
  Environment* env = Environment::GetCurrent(args);
  CHECK_GE(args.Length(), 1);
  CHECK(args[0]->IsString());
  Utf8Value input(env->isolate(), args[0]);
  args.GetReturnValue().Set(HasInjection(env, *input));
}

void Initialize(Local<Object> target,
                Local<Value> unused,
                Local<Context> context) {
  Environment* env = Environment::GetCurrent(context);
  env->SetMethod(target, "getLexerTokens", GetPostgresTokens);
}

}  // namespace pglexer
}  // namespace node

NODE_BUILTIN_MODULE_CONTEXT_AWARE(pg_lexer, node::pglexer::Initialize)

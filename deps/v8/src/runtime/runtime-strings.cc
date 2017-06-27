// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/runtime/runtime-utils.h"

#include "src/arguments.h"
#include "src/conversions.h"
#include "src/counters.h"
#include "src/objects-inl.h"
#include "src/regexp/jsregexp-inl.h"
#include "src/regexp/regexp-utils.h"
#include "src/string-builder.h"
#include "src/string-search.h"

namespace v8 {
namespace internal {

RUNTIME_FUNCTION(Runtime_GetSubstitution) {
  HandleScope scope(isolate);
  DCHECK_EQ(5, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, matched, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, subject, 1);
  CONVERT_SMI_ARG_CHECKED(position, 2);
  CONVERT_ARG_HANDLE_CHECKED(String, replacement, 3);
  CONVERT_SMI_ARG_CHECKED(start_index, 4);

  // A simple match without captures.
  class SimpleMatch : public String::Match {
   public:
    SimpleMatch(Handle<String> match, Handle<String> prefix,
                Handle<String> suffix)
        : match_(match), prefix_(prefix), suffix_(suffix) {}

    Handle<String> GetMatch() override { return match_; }
    Handle<String> GetPrefix() override { return prefix_; }
    Handle<String> GetSuffix() override { return suffix_; }

    int CaptureCount() override { return 0; }
    bool HasNamedCaptures() override { return false; }
    MaybeHandle<String> GetCapture(int i, bool* capture_exists) override {
      *capture_exists = false;
      return match_;  // Return arbitrary string handle.
    }
    MaybeHandle<String> GetNamedCapture(Handle<String> name,
                                        CaptureState* state) override {
      UNREACHABLE();
      *state = INVALID;
      return MaybeHandle<String>();
    }

   private:
    Handle<String> match_, prefix_, suffix_;
  };

  Handle<String> prefix =
      isolate->factory()->NewSubString(subject, 0, position);
  Handle<String> suffix = isolate->factory()->NewSubString(
      subject, position + matched->length(), subject->length());
  SimpleMatch match(matched, prefix, suffix);

  RETURN_RESULT_OR_FAILURE(
      isolate,
      String::GetSubstitution(isolate, &match, replacement, start_index));
}

// This may return an empty MaybeHandle if an exception is thrown or
// we abort due to reaching the recursion limit.
MaybeHandle<String> StringReplaceOneCharWithString(
    Isolate* isolate, Handle<String> subject, Handle<String> search,
    Handle<String> replace, bool* found, int recursion_limit) {
  StackLimitCheck stackLimitCheck(isolate);
  if (stackLimitCheck.HasOverflowed() || (recursion_limit == 0)) {
    return MaybeHandle<String>();
  }
  recursion_limit--;
  if (subject->IsConsString()) {
    ConsString* cons = ConsString::cast(*subject);
    Handle<String> first = Handle<String>(cons->first());
    Handle<String> second = Handle<String>(cons->second());
    Handle<String> new_first;
    if (!StringReplaceOneCharWithString(isolate, first, search, replace, found,
                                        recursion_limit).ToHandle(&new_first)) {
      return MaybeHandle<String>();
    }
    if (*found) return isolate->factory()->NewConsString(new_first, second);

    Handle<String> new_second;
    if (!StringReplaceOneCharWithString(isolate, second, search, replace, found,
                                        recursion_limit)
             .ToHandle(&new_second)) {
      return MaybeHandle<String>();
    }
    if (*found) return isolate->factory()->NewConsString(first, new_second);

    return subject;
  } else {
    int index = String::IndexOf(isolate, subject, search, 0);
    if (index == -1) return subject;
    *found = true;
    Handle<String> first = isolate->factory()->NewSubString(subject, 0, index);
    Handle<String> cons1;
    ASSIGN_RETURN_ON_EXCEPTION(
        isolate, cons1, isolate->factory()->NewConsString(first, replace),
        String);
    Handle<String> second =
        isolate->factory()->NewSubString(subject, index + 1, subject->length());
    return isolate->factory()->NewConsString(cons1, second);
  }
}

// TaintV8
RUNTIME_FUNCTION(Runtime_StringIsTainted) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 1);
  CONVERT_ARG_HANDLE_CHECKED(String, str, 0);

  StringTaint taint = str->GetTaint(); 
  if(taint.hasTaint()) {
    return isolate->heap()->true_value();
  } else {
    return isolate->heap()->false_value();
  }
}

RUNTIME_FUNCTION(Runtime_StringGetTaint) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 1);
  CONVERT_ARG_HANDLE_CHECKED(String, str, 0);

  const StringTaint& taint = str->GetTaint();
  int length = 0;
  for (const TaintRange& taint_range : taint) {
    //Hackfix
    taint_range.begin();
    length++;
  }
  Handle<FixedArray> fast_elements = isolate->factory()->NewFixedArray(length);
  int i = 0;
  for (const TaintRange& taint_range : taint) {
    Handle<JSObject> range = isolate->factory()->NewJSObject(isolate->object_function(), NOT_TENURED);
    Handle<String> key_begin = isolate->factory()->InternalizeUtf8String("begin");
    Handle<String> key_end = isolate->factory()->InternalizeUtf8String("end");
    Handle<Object> begin = isolate->factory()->NewNumberFromUint(taint_range.begin(), NOT_TENURED);
    Handle<Object> end = isolate->factory()->NewNumberFromUint(taint_range.end(), NOT_TENURED);
    JSObject::DefinePropertyOrElementIgnoreAttributes(range, key_begin, begin).Check();
    JSObject::DefinePropertyOrElementIgnoreAttributes(range, key_end, end).Check();

    int flow_length = 0;
    for (TaintNode& taint_node : taint_range.flow()) {
      //Hackfix
      taint_node.operation();
      flow_length++;
    }

    //Build the flow array which includes the operations and the arguments
    int j = 0;
    Handle<FixedArray> flow_elements = isolate->factory()->NewFixedArray(flow_length);

    for (TaintNode& taint_node : taint_range.flow()) {
      Handle<JSObject> flow_object = isolate->factory()->NewJSObject(isolate->object_function(), NOT_TENURED);
      Handle<String> key_operation = isolate->factory()->InternalizeUtf8String("operation");
      Handle<String> operation = isolate->factory()->InternalizeUtf8String(taint_node.operation().name());

      //Build the arguments array, which includes the arguments for each operation
      int operation_length = 0;
      std::vector<std::u16string> arguments = taint_node.operation().arguments();
      for (auto& s : arguments) {
        operation_length++;
      }

      int k = 0;
      Handle<FixedArray> argument_elements = isolate->factory()->NewFixedArray(operation_length);
      for (auto& s : arguments) {
        Handle<SeqTwoByteString> argument = isolate->factory()->NewRawTwoByteString(s.length()).ToHandleChecked();
        uint16_t* data = argument->GetChars();
        for (int i = 0; i < s.length(); i++) {
          data[i] = s[i];
        }

        argument_elements->set(k, *argument);
        k++;
      }

      Handle<String> key_argument = isolate->factory()->InternalizeUtf8String("arguments");
      Handle<JSArray> arguments_array = isolate->factory()->NewJSArrayWithElements(argument_elements);
      JSObject::DefinePropertyOrElementIgnoreAttributes(flow_object, key_argument, arguments_array).Check();

      JSObject::DefinePropertyOrElementIgnoreAttributes(flow_object, key_operation, operation).Check();
      flow_elements->set(j, *flow_object);
      j++;
    }

    Handle<String> key_flow = isolate->factory()->InternalizeUtf8String("flow");
    Handle<JSArray> array = isolate->factory()->NewJSArrayWithElements(flow_elements);
    JSObject::DefinePropertyOrElementIgnoreAttributes(range, key_flow, array).Check();

    fast_elements->set(i, *range);
    i++;
  }

  Handle<JSArray> result = isolate->factory()->NewJSArrayWithElements(fast_elements);
  result->set_length(Smi::FromInt(length));
  return *result;
}

static inline char16_t* AsciiToTwoByteString(const char* source) {
  int array_length = i::StrLength(source) + 1;
  char16_t* converted = i::NewArray<char16_t>(array_length);
  for (int i = 0; i < array_length; i++) converted[i] = source[i];
  return converted;
}

RUNTIME_FUNCTION(Runtime_StringSetTaint) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 3);
  CONVERT_ARG_HANDLE_CHECKED(String, str, 0);
  CONVERT_ARG_HANDLE_CHECKED(JSArray, array, 1);
  CONVERT_ARG_HANDLE_CHECKED(String, source, 2);

  // We have to allocate a new string to prevent StringCaches and such
  Handle<String> result;
  str = String::Flatten(str);
  DisallowHeapAllocation no_gc;
  String::FlatContent content = str->GetFlatContent();

  AllowHeapAllocation allow;
  if (str->IsOneByteRepresentation()) {
    result = isolate->factory()->NewStringFromOneByte(content.ToOneByteVector()).ToHandleChecked();
  } else {
    result = isolate->factory()->NewStringFromTwoByte(content.ToUC16Vector()).ToHandleChecked();
  }

  char* buf = (char*) Malloced::New(source->length() + 1);
  memcpy(buf, (const char*)SeqOneByteString::cast(*source)->GetChars(), source->length());
  buf[source->length()] = 0;

  // Fill arguments array of TaintOperation
  FixedArray* elements = FixedArray::cast(array->elements());
  std::vector<std::u16string> operations_args(elements->length());
  for (int i = 0; i < elements->length(); i++) {
    String* string = String::cast(elements->get(i));
    int length = string->length();
    std::u16string u16str;

    if (string->IsOneByteRepresentation()) {
      const char* chars = (const char*)SeqOneByteString::cast(string)->GetChars();
      char16_t* data = AsciiToTwoByteString(chars);
      u16str = std::u16string(data, length);
      DeleteArray(data);
    } else {
      u16str = std::u16string((const char16_t*)SeqTwoByteString::cast(string)->GetChars(), length);
    }

    operations_args[i] = u16str;
  }

  result->SetTaint(StringTaint(0, str->length(), TaintSource(buf, operations_args)));
  Malloced::Delete(buf);
  return *result;
}

RUNTIME_FUNCTION(Runtime_StringRemoveTaint) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 1);
  CONVERT_ARG_HANDLE_CHECKED(String, str, 0);
  StringTaint oldTaint =  str->GetTaint();
  if (!oldTaint.hasTaint()) {
    return *str;
  }

  int length = str->length();
  if (str->IsOneByteRepresentation()) {
    Handle<SeqOneByteString> result;
    ASSIGN_RETURN_FAILURE_ON_EXCEPTION(
      isolate, result, isolate->factory()->NewRawOneByteString(length));
    CopyChars(result->GetChars(), SeqOneByteString::cast(*str)->GetChars(), length);
    return *result;
  } else {
    Handle<SeqTwoByteString> result;
    ASSIGN_RETURN_FAILURE_ON_EXCEPTION(
      isolate, result, isolate->factory()->NewRawTwoByteString(length));
    CopyChars(result->GetChars(), SeqTwoByteString::cast(*str)->GetChars(), length);
    return *result;
  }
}

RUNTIME_FUNCTION(Runtime_StringReplaceOneCharWithString) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, subject, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, search, 1);
  CONVERT_ARG_HANDLE_CHECKED(String, replace, 2);

  // If the cons string tree is too deep, we simply abort the recursion and
  // retry with a flattened subject string.
  const int kRecursionLimit = 0x1000;
  bool found = false;
  Handle<String> result;
  if (StringReplaceOneCharWithString(isolate, subject, search, replace, &found,
                                     kRecursionLimit).ToHandle(&result)) {
    return *result;
  }
  if (isolate->has_pending_exception()) return isolate->heap()->exception();

  subject = String::Flatten(subject);
  if (StringReplaceOneCharWithString(isolate, subject, search, replace, &found,
                                     kRecursionLimit).ToHandle(&result)) {
    return *result;
  }
  if (isolate->has_pending_exception()) return isolate->heap()->exception();
  // In case of empty handle and no pending exception we have stack overflow.
  return isolate->StackOverflow();
}

// ES6 #sec-string.prototype.includes
// String.prototype.includes(searchString [, position])
RUNTIME_FUNCTION(Runtime_StringIncludes) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());

  Handle<Object> receiver = args.at(0);
  if (receiver->IsNullOrUndefined(isolate)) {
    THROW_NEW_ERROR_RETURN_FAILURE(
        isolate, NewTypeError(MessageTemplate::kCalledOnNullOrUndefined,
                              isolate->factory()->NewStringFromAsciiChecked(
                                  "String.prototype.includes")));
  }
  Handle<String> receiver_string;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, receiver_string,
                                     Object::ToString(isolate, receiver));

  // Check if the search string is a regExp and fail if it is.
  Handle<Object> search = args.at(1);
  Maybe<bool> is_reg_exp = RegExpUtils::IsRegExp(isolate, search);
  if (is_reg_exp.IsNothing()) {
    DCHECK(isolate->has_pending_exception());
    return isolate->heap()->exception();
  }
  if (is_reg_exp.FromJust()) {
    THROW_NEW_ERROR_RETURN_FAILURE(
        isolate, NewTypeError(MessageTemplate::kFirstArgumentNotRegExp,
                              isolate->factory()->NewStringFromStaticChars(
                                  "String.prototype.includes")));
  }
  Handle<String> search_string;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, search_string,
                                     Object::ToString(isolate, args.at(1)));
  Handle<Object> position;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, position,
                                     Object::ToInteger(isolate, args.at(2)));

  uint32_t index = receiver_string->ToValidIndex(*position);
  int index_in_str =
      String::IndexOf(isolate, receiver_string, search_string, index);
  return *isolate->factory()->ToBoolean(index_in_str != -1);
}

// ES6 #sec-string.prototype.indexof
// String.prototype.indexOf(searchString [, position])
RUNTIME_FUNCTION(Runtime_StringIndexOf) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());
  return String::IndexOf(isolate, args.at(0), args.at(1), args.at(2));
}

// ES6 #sec-string.prototype.indexof
// String.prototype.indexOf(searchString, position)
// Fast version that assumes that does not perform conversions of the incoming
// arguments.
RUNTIME_FUNCTION(Runtime_StringIndexOfUnchecked) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());
  Handle<String> receiver_string = args.at<String>(0);
  Handle<String> search_string = args.at<String>(1);
  int index = std::min(std::max(args.smi_at(2), 0), receiver_string->length());

  return Smi::FromInt(String::IndexOf(isolate, receiver_string, search_string,
                                      static_cast<uint32_t>(index)));
}

RUNTIME_FUNCTION(Runtime_StringLastIndexOf) {
  HandleScope handle_scope(isolate);
  return String::LastIndexOf(isolate, args.at(0), args.at(1),
                             isolate->factory()->undefined_value());
}

RUNTIME_FUNCTION(Runtime_SubString) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());

  CONVERT_ARG_HANDLE_CHECKED(String, string, 0);
  int start, end;
  // We have a fast integer-only case here to avoid a conversion to double in
  // the common case where from and to are Smis.
  if (args[1]->IsSmi() && args[2]->IsSmi()) {
    CONVERT_SMI_ARG_CHECKED(from_number, 1);
    CONVERT_SMI_ARG_CHECKED(to_number, 2);
    start = from_number;
    end = to_number;
  } else if (args[1]->IsNumber() && args[2]->IsNumber()) {
    CONVERT_DOUBLE_ARG_CHECKED(from_number, 1);
    CONVERT_DOUBLE_ARG_CHECKED(to_number, 2);
    start = FastD2IChecked(from_number);
    end = FastD2IChecked(to_number);
  } else {
    return isolate->ThrowIllegalOperation();
  }
  // The following condition is intentionally robust because the SubStringStub
  // delegates here and we test this in cctest/test-strings/RobustSubStringStub.
  if (end < start || start < 0 || end > string->length()) {
    return isolate->ThrowIllegalOperation();
  }
  isolate->counters()->sub_string_runtime()->Increment();

  return *isolate->factory()->NewSubString(string, start, end);
}

RUNTIME_FUNCTION(Runtime_StringAdd) {
  HandleScope scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, str1, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, str2, 1);
  isolate->counters()->string_add_runtime()->Increment();
  RETURN_RESULT_OR_FAILURE(isolate,
                           isolate->factory()->NewConsString(str1, str2));
}


RUNTIME_FUNCTION(Runtime_InternalizeString) {
  HandleScope handles(isolate);
  DCHECK_EQ(1, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, string, 0);
  return *isolate->factory()->InternalizeString(string);
}

RUNTIME_FUNCTION(Runtime_StringCharCodeAtRT) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());

  CONVERT_ARG_HANDLE_CHECKED(String, subject, 0);
  CONVERT_NUMBER_CHECKED(uint32_t, i, Uint32, args[1]);

  // Flatten the string.  If someone wants to get a char at an index
  // in a cons string, it is likely that more indices will be
  // accessed.
  subject = String::Flatten(subject);

  if (i >= static_cast<uint32_t>(subject->length())) {
    return isolate->heap()->nan_value();
  }

  return Smi::FromInt(subject->Get(i));
}

RUNTIME_FUNCTION(Runtime_StringCompare) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, x, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, y, 1);
  isolate->counters()->string_compare_runtime()->Increment();
  switch (String::Compare(x, y)) {
    case ComparisonResult::kLessThan:
      return Smi::FromInt(LESS);
    case ComparisonResult::kEqual:
      return Smi::FromInt(EQUAL);
    case ComparisonResult::kGreaterThan:
      return Smi::FromInt(GREATER);
    case ComparisonResult::kUndefined:
      break;
  }
  UNREACHABLE();
}

RUNTIME_FUNCTION(Runtime_StringBuilderConcat) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());
  CONVERT_ARG_HANDLE_CHECKED(JSArray, array, 0);
  int32_t array_length;
  if (!args[1]->ToInt32(&array_length)) {
    THROW_NEW_ERROR_RETURN_FAILURE(isolate, NewInvalidStringLengthError());
  }
  CONVERT_ARG_HANDLE_CHECKED(String, special, 2);

  size_t actual_array_length = 0;
  CHECK(TryNumberToSize(array->length(), &actual_array_length));
  CHECK(array_length >= 0);
  CHECK(static_cast<size_t>(array_length) <= actual_array_length);

  // This assumption is used by the slice encoding in one or two smis.
  DCHECK(Smi::kMaxValue >= String::kMaxLength);

  CHECK(array->HasFastElements());
  JSObject::EnsureCanContainHeapObjectElements(array);

  int special_length = special->length();
  if (!array->HasObjectElements()) {
    return isolate->Throw(isolate->heap()->illegal_argument_string());
  }

  int length;
  bool one_byte = special->HasOnlyOneByteChars();

  {
    DisallowHeapAllocation no_gc;
    FixedArray* fixed_array = FixedArray::cast(array->elements());
    if (fixed_array->length() < array_length) {
      array_length = fixed_array->length();
    }

    if (array_length == 0) {
      return isolate->heap()->empty_string();
    } else if (array_length == 1) {
      Object* first = fixed_array->get(0);
      if (first->IsString()) return first;
    }
    length = StringBuilderConcatLength(special_length, fixed_array,
                                       array_length, &one_byte);
  }

  if (length == -1) {
    return isolate->Throw(isolate->heap()->illegal_argument_string());
  }
  if (length == 0) {
    return isolate->heap()->empty_string();
  }

  if (one_byte) {
    Handle<SeqOneByteString> answer;
    ASSIGN_RETURN_FAILURE_ON_EXCEPTION(
        isolate, answer, isolate->factory()->NewRawOneByteString(length));
    StringBuilderConcatHelper(*special, answer->GetChars(),
                              FixedArray::cast(array->elements()),
                              array_length);
    return *answer;
  } else {
    Handle<SeqTwoByteString> answer;
    ASSIGN_RETURN_FAILURE_ON_EXCEPTION(
        isolate, answer, isolate->factory()->NewRawTwoByteString(length));
    StringBuilderConcatHelper(*special, answer->GetChars(),
                              FixedArray::cast(array->elements()),
                              array_length);
    return *answer;
  }
}

RUNTIME_FUNCTION(Runtime_StringBuilderJoin) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());
  CONVERT_ARG_HANDLE_CHECKED(JSArray, array, 0);
  int32_t array_length;
  if (!args[1]->ToInt32(&array_length)) {
    THROW_NEW_ERROR_RETURN_FAILURE(isolate, NewInvalidStringLengthError());
  }
  CONVERT_ARG_HANDLE_CHECKED(String, separator, 2);
  CHECK(array->HasObjectElements());
  CHECK(array_length >= 0);

  Handle<FixedArray> fixed_array(FixedArray::cast(array->elements()));
  if (fixed_array->length() < array_length) {
    array_length = fixed_array->length();
  }

  if (array_length == 0) {
    return isolate->heap()->empty_string();
  } else if (array_length == 1) {
    Object* first = fixed_array->get(0);
    CHECK(first->IsString());
    return first;
  }

  int separator_length = separator->length();
  CHECK(separator_length > 0);
  int max_nof_separators =
      (String::kMaxLength + separator_length - 1) / separator_length;
  if (max_nof_separators < (array_length - 1)) {
    THROW_NEW_ERROR_RETURN_FAILURE(isolate, NewInvalidStringLengthError());
  }
  int length = (array_length - 1) * separator_length;
  for (int i = 0; i < array_length; i++) {
    Object* element_obj = fixed_array->get(i);
    CHECK(element_obj->IsString());
    String* element = String::cast(element_obj);
    int increment = element->length();
    if (increment > String::kMaxLength - length) {
      STATIC_ASSERT(String::kMaxLength < kMaxInt);
      length = kMaxInt;  // Provoke exception;
      break;
    }
    length += increment;
  }

  Handle<SeqTwoByteString> answer;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(
      isolate, answer, isolate->factory()->NewRawTwoByteString(length));

  DisallowHeapAllocation no_gc;

  uc16* sink = answer->GetChars();
#ifdef DEBUG
  uc16* end = sink + length;
#endif

  CHECK(fixed_array->get(0)->IsString());
  String* first = String::cast(fixed_array->get(0));
  String* separator_raw = *separator;

  int first_length = first->length();
  String::WriteToFlat(first, sink, 0, first_length);
  sink += first_length;

  for (int i = 1; i < array_length; i++) {
    DCHECK(sink + separator_length <= end);
    String::WriteToFlat(separator_raw, sink, 0, separator_length);
    sink += separator_length;

    CHECK(fixed_array->get(i)->IsString());
    String* element = String::cast(fixed_array->get(i));
    int element_length = element->length();
    DCHECK(sink + element_length <= end);
    String::WriteToFlat(element, sink, 0, element_length);
    sink += element_length;
  }
  DCHECK(sink == end);

  // Use %_FastOneByteArrayJoin instead.
  DCHECK(!answer->IsOneByteRepresentation());
  return *answer;
}

template <typename sinkchar>
static void WriteRepeatToFlat(String* src, Vector<sinkchar> buffer, int cursor,
                              int repeat, int length) {
  if (repeat == 0) return;

  sinkchar* start = &buffer[cursor];
  String::WriteToFlat<sinkchar>(src, start, 0, length);

  int done = 1;
  sinkchar* next = start + length;

  while (done < repeat) {
    int block = Min(done, repeat - done);
    int block_chars = block * length;
    CopyChars(next, start, block_chars);
    next += block_chars;
    done += block;
  }
}

template <typename Char>
static void JoinSparseArrayWithSeparator(FixedArray* elements,
                                         int elements_length,
                                         uint32_t array_length,
                                         String* separator,
                                         Vector<Char> buffer) {
  DisallowHeapAllocation no_gc;
  int previous_separator_position = 0;
  int separator_length = separator->length();
  DCHECK_LT(0, separator_length);
  int cursor = 0;
  for (int i = 0; i < elements_length; i += 2) {
    int position = NumberToInt32(elements->get(i));
    String* string = String::cast(elements->get(i + 1));
    int string_length = string->length();
    if (string->length() > 0) {
      int repeat = position - previous_separator_position;
      WriteRepeatToFlat<Char>(separator, buffer, cursor, repeat,
                              separator_length);
      cursor += repeat * separator_length;
      previous_separator_position = position;
      String::WriteToFlat<Char>(string, &buffer[cursor], 0, string_length);
      cursor += string->length();
    }
  }

  int last_array_index = static_cast<int>(array_length - 1);
  // Array length must be representable as a signed 32-bit number,
  // otherwise the total string length would have been too large.
  DCHECK(array_length <= 0x7fffffff);  // Is int32_t.
  int repeat = last_array_index - previous_separator_position;
  WriteRepeatToFlat<Char>(separator, buffer, cursor, repeat, separator_length);
  cursor += repeat * separator_length;
  DCHECK(cursor <= buffer.length());
}

RUNTIME_FUNCTION(Runtime_SparseJoinWithSeparator) {
  HandleScope scope(isolate);
  DCHECK_EQ(3, args.length());
  CONVERT_ARG_HANDLE_CHECKED(JSArray, elements_array, 0);
  CONVERT_NUMBER_CHECKED(uint32_t, array_length, Uint32, args[1]);
  CONVERT_ARG_HANDLE_CHECKED(String, separator, 2);
  // elements_array is fast-mode JSarray of alternating positions
  // (increasing order) and strings.
  CHECK(elements_array->HasSmiOrObjectElements());
  // array_length is length of original array (used to add separators);
  // separator is string to put between elements. Assumed to be non-empty.
  CHECK(array_length > 0);

  // Find total length of join result.
  int string_length = 0;
  bool is_one_byte = separator->IsOneByteRepresentation();
  bool overflow = false;
  CONVERT_NUMBER_CHECKED(int, elements_length, Int32, elements_array->length());
  CHECK(elements_length <= elements_array->elements()->length());
  CHECK((elements_length & 1) == 0);  // Even length.
  FixedArray* elements = FixedArray::cast(elements_array->elements());
  {
    DisallowHeapAllocation no_gc;
    for (int i = 0; i < elements_length; i += 2) {
      String* string = String::cast(elements->get(i + 1));
      int length = string->length();
      if (is_one_byte && !string->IsOneByteRepresentation()) {
        is_one_byte = false;
      }
      if (length > String::kMaxLength ||
          String::kMaxLength - length < string_length) {
        overflow = true;
        break;
      }
      string_length += length;
    }
  }

  int separator_length = separator->length();
  if (!overflow && separator_length > 0) {
    if (array_length <= 0x7fffffffu) {
      int separator_count = static_cast<int>(array_length) - 1;
      int remaining_length = String::kMaxLength - string_length;
      if ((remaining_length / separator_length) >= separator_count) {
        string_length += separator_length * (array_length - 1);
      } else {
        // Not room for the separators within the maximal string length.
        overflow = true;
      }
    } else {
      // Nonempty separator and at least 2^31-1 separators necessary
      // means that the string is too large to create.
      STATIC_ASSERT(String::kMaxLength < 0x7fffffff);
      overflow = true;
    }
  }
  if (overflow) {
    // Throw an exception if the resulting string is too large. See
    // https://code.google.com/p/chromium/issues/detail?id=336820
    // for details.
    THROW_NEW_ERROR_RETURN_FAILURE(isolate, NewInvalidStringLengthError());
  }

  if (is_one_byte) {
    Handle<SeqOneByteString> result = isolate->factory()
                                          ->NewRawOneByteString(string_length)
                                          .ToHandleChecked();
    JoinSparseArrayWithSeparator<uint8_t>(
        FixedArray::cast(elements_array->elements()), elements_length,
        array_length, *separator,
        Vector<uint8_t>(result->GetChars(), string_length));
    return *result;
  } else {
    Handle<SeqTwoByteString> result = isolate->factory()
                                          ->NewRawTwoByteString(string_length)
                                          .ToHandleChecked();
    JoinSparseArrayWithSeparator<uc16>(
        FixedArray::cast(elements_array->elements()), elements_length,
        array_length, *separator,
        Vector<uc16>(result->GetChars(), string_length));
    return *result;
  }
}

// Copies Latin1 characters to the given fixed array looking up
// one-char strings in the cache. Gives up on the first char that is
// not in the cache and fills the remainder with smi zeros. Returns
// the length of the successfully copied prefix.
static int CopyCachedOneByteCharsToArray(Heap* heap, const uint8_t* chars,
                                         FixedArray* elements, int length) {
  DisallowHeapAllocation no_gc;
  FixedArray* one_byte_cache = heap->single_character_string_cache();
  Object* undefined = heap->undefined_value();
  int i;
  WriteBarrierMode mode = elements->GetWriteBarrierMode(no_gc);
  for (i = 0; i < length; ++i) {
    Object* value = one_byte_cache->get(chars[i]);
    if (value == undefined) break;
    elements->set(i, value, mode);
  }
  if (i < length) {
    DCHECK(Smi::kZero == 0);
    memset(elements->data_start() + i, 0, kPointerSize * (length - i));
  }
#ifdef DEBUG
  for (int j = 0; j < length; ++j) {
    Object* element = elements->get(j);
    DCHECK(element == Smi::kZero ||
           (element->IsString() && String::cast(element)->LooksValid()));
  }
#endif
  return i;
}

// Converts a String to JSArray.
// For example, "foo" => ["f", "o", "o"].
RUNTIME_FUNCTION(Runtime_StringToArray) {
  HandleScope scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, s, 0);
  CONVERT_NUMBER_CHECKED(uint32_t, limit, Uint32, args[1]);

  s = String::Flatten(s);
  const int length = static_cast<int>(Min<uint32_t>(s->length(), limit));

  Handle<FixedArray> elements;
  int position = 0;
  if (s->IsFlat() && s->IsOneByteRepresentation()) {
    // Try using cached chars where possible.
    elements = isolate->factory()->NewUninitializedFixedArray(length);

    DisallowHeapAllocation no_gc;
    String::FlatContent content = s->GetFlatContent();
    if (content.IsOneByte()) {
      Vector<const uint8_t> chars = content.ToOneByteVector();
      // Note, this will initialize all elements (not only the prefix)
      // to prevent GC from seeing partially initialized array.
      position = CopyCachedOneByteCharsToArray(isolate->heap(), chars.start(),
                                               *elements, length);
    } else {
      MemsetPointer(elements->data_start(), isolate->heap()->undefined_value(),
                    length);
    }
  } else {
    elements = isolate->factory()->NewFixedArray(length);
  }
  for (int i = position; i < length; ++i) {
    Handle<Object> str =
        isolate->factory()->LookupSingleCharacterStringFromCode(s->Get(i));
    elements->set(i, *str);
  }

#ifdef DEBUG
  for (int i = 0; i < length; ++i) {
    DCHECK(String::cast(elements->get(i))->length() == 1);
  }
#endif

  return *isolate->factory()->NewJSArrayWithElements(elements);
}

RUNTIME_FUNCTION(Runtime_StringLessThan) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, x, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, y, 1);
  switch (String::Compare(x, y)) {
    case ComparisonResult::kLessThan:
      return isolate->heap()->true_value();
    case ComparisonResult::kEqual:
    case ComparisonResult::kGreaterThan:
      return isolate->heap()->false_value();
    case ComparisonResult::kUndefined:
      break;
  }
  UNREACHABLE();
}

RUNTIME_FUNCTION(Runtime_StringLessThanOrEqual) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, x, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, y, 1);
  switch (String::Compare(x, y)) {
    case ComparisonResult::kEqual:
    case ComparisonResult::kLessThan:
      return isolate->heap()->true_value();
    case ComparisonResult::kGreaterThan:
      return isolate->heap()->false_value();
    case ComparisonResult::kUndefined:
      break;
  }
  UNREACHABLE();
}

RUNTIME_FUNCTION(Runtime_StringGreaterThan) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, x, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, y, 1);
  switch (String::Compare(x, y)) {
    case ComparisonResult::kGreaterThan:
      return isolate->heap()->true_value();
    case ComparisonResult::kEqual:
    case ComparisonResult::kLessThan:
      return isolate->heap()->false_value();
    case ComparisonResult::kUndefined:
      break;
  }
  UNREACHABLE();
}

RUNTIME_FUNCTION(Runtime_StringGreaterThanOrEqual) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, x, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, y, 1);
  switch (String::Compare(x, y)) {
    case ComparisonResult::kEqual:
    case ComparisonResult::kGreaterThan:
      return isolate->heap()->true_value();
    case ComparisonResult::kLessThan:
      return isolate->heap()->false_value();
    case ComparisonResult::kUndefined:
      break;
  }
  UNREACHABLE();
}

RUNTIME_FUNCTION(Runtime_StringEqual) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, x, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, y, 1);
  return isolate->heap()->ToBoolean(String::Equals(x, y));
}

RUNTIME_FUNCTION(Runtime_StringNotEqual) {
  HandleScope handle_scope(isolate);
  DCHECK_EQ(2, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, x, 0);
  CONVERT_ARG_HANDLE_CHECKED(String, y, 1);
  return isolate->heap()->ToBoolean(!String::Equals(x, y));
}

RUNTIME_FUNCTION(Runtime_FlattenString) {
  HandleScope scope(isolate);
  DCHECK_EQ(1, args.length());
  CONVERT_ARG_HANDLE_CHECKED(String, str, 0);
  return *String::Flatten(str);
}

RUNTIME_FUNCTION(Runtime_StringCharFromCode) {
  HandleScope handlescope(isolate);
  DCHECK_EQ(1, args.length());
  if (args[0]->IsNumber()) {
    CONVERT_NUMBER_CHECKED(uint32_t, code, Uint32, args[0]);
    code &= 0xffff;
    return *isolate->factory()->LookupSingleCharacterStringFromCode(code);
  }
  return isolate->heap()->empty_string();
}

RUNTIME_FUNCTION(Runtime_StringCharCodeAt) {
  SealHandleScope shs(isolate);
  DCHECK_EQ(2, args.length());
  if (!args[0]->IsString()) return isolate->heap()->undefined_value();
  if (!args[1]->IsNumber()) return isolate->heap()->undefined_value();
  if (std::isinf(args.number_at(1))) return isolate->heap()->nan_value();
  return __RT_impl_Runtime_StringCharCodeAtRT(args, isolate);
}

RUNTIME_FUNCTION(Runtime_StringMaxLength) {
  SealHandleScope shs(isolate);
  return Smi::FromInt(String::kMaxLength);
}

}  // namespace internal
}  // namespace v8

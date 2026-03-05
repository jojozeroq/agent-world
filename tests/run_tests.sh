#!/usr/bin/env bash
# Test suite for Agent World automation

TESTS_PASSED=0
TESTS_FAILED=0

assert_eq() {
  local expected="$1"
  local actual="$2"
  local msg="${3:-Assertion failed}"
  
  if [ "$expected" = "$actual" ]; then
    echo "✓ $msg"
    ((TESTS_PASSED++))
  else
    echo "✗ $msg"
    echo "  Expected: $expected"
    echo "  Actual: $actual"
    ((TESTS_FAILED++))
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local msg="${3:-Contains check failed}"
  
  if [[ "$haystack" == *"$needle"* ]]; then
    echo "✓ $msg"
    ((TESTS_PASSED++))
  else
    echo "✗ $msg"
    ((TESTS_FAILED++))
  fi
}

# Test task extractor
test_task_extractor() {
  echo "Testing task extractor..."
  
  local result=$(bash lib/task_extractor.sh "需要实现登录")
  assert_contains "$result" "需要实现登录" "Extract simple task"
  
  local result=$(bash lib/task_extractor.sh "TODO: 修复bug")
  assert_contains "$result" "TODO: 修复bug" "Extract TODO"
}

# Run tests
test_task_extractor

echo ""
echo "Tests: $TESTS_PASSED passed, $TESTS_FAILED failed"
[ $TESTS_FAILED -eq 0 ] && exit 0 || exit 1

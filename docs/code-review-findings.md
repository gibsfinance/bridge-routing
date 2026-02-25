# Code Review Findings

## Critical Issues

### 1. Throwing null instead of Error object
**File:** `packages/common/src/multicall.ts:47`
**Severity:** High
**Issue:** The code throws `reads` (which is null) instead of a proper Error object:
```typescript
if (!reads) throw reads  // throws null
```

**Impact:** Error handlers expecting Error objects will fail. Stack traces won't be available. This violates JavaScript best practices.

**Recommendation:**
```typescript
if (!reads) throw new Error('Multicall read returned no results')
```

## Potential Issues

### 2. Array access without bounds checking
**File:** `packages/bridge-sdk/src/config.ts:311,315`
**Severity:** Medium
**Issue:** Accessing array index [0] without checking if array is empty:
```typescript
: (Object.keys(pathways[provider])[0] as Chains)
: (Object.keys(pathways[provider]![nextFromChain]!)[0] as Chains)
```

**Impact:** Could throw runtime error if `pathways` data structure is incomplete or modified.

**Mitigation:** Currently safe because `pathways` is hardcoded and always contains data. However, adding a fallback or validation would make it more robust.

**Recommendation:**
```typescript
const keys = Object.keys(pathways[provider])
if (keys.length === 0) throw new Error(`No pathways for provider ${provider}`)
const nextFromChain = currentFromChainIsValid ? from : keys[0] as Chains
```

### 3. Implicit falsy checks with BigInt
**Files:** Multiple in `packages/bridge-sdk/src/settings.ts`
**Severity:** Low
**Issue:** Using `!value` for BigInt null checks also catches `0n`:
```typescript
if (!amountAfterBridgeFee) return null  // returns null for both null and 0n
if (!priceCorrective) return null       // returns null for both null and 0n
```

**Impact:** `0n` is a valid BigInt value but treated as falsy. This could cause unexpected null returns when amount is legitimately 0.

**Current Behavior:** Actually safe in most cases because:
- Division by 0n would throw anyway
- Returning null for 0 amounts is often the desired behavior
- The functions are used in contexts where 0 means "not set"

**Recommendation:** If 0n is a valid value, use explicit checks:
```typescript
if (amountAfterBridgeFee === null) return null  // explicit null check
```

## Code Quality Notes

### Good Practices Found

1. **BigInt usage**: Proper use of BigInt throughout for wei amounts prevents overflow
2. **Null propagation**: Consistent pattern of returning null for invalid/missing values
3. **Type safety**: Strong typing with TypeScript
4. **Memoization**: Appropriate use of memoization for expensive operations
5. **Constants**: Magic numbers extracted as named constants (basisPoints, oneEther)

### Test Coverage Improvements

From 75 tests to 172 tests (+97 tests):
- Bridge SDK: 22.2% → 38.18% (+16%)
- Common: 27.8% → 42.24% (+14.44%)

**Modules with 100% coverage:**
- abis.ts
- chains.ts
- config.ts (91.27%)
- fee-type.ts
- cache.ts
- serialize.ts

**Modules needing more coverage:**
- settings.ts: 14.25% (many functions with complex dependencies)
- chain-info.ts: 0% (requires PublicClient mocking)
- multicall.ts: 4.16% (requires contract interaction testing)
- erc20.ts: 40% (partial coverage)
- client.ts: 25.49% (partial coverage)

## Summary

**Critical:** 1 issue (throwing null)
**Medium:** 1 issue (array bounds)
**Low:** Multiple instances of implicit falsy BigInt checks

Overall code quality is good with strong type safety and consistent patterns. The critical issue should be fixed immediately. Other issues are edge cases that are currently mitigated by the hardcoded data structures and usage patterns.

# Order Workflow Simplification Plan

## Overview

Simplify the order processing from creation to completion/failure with a fun, customer-centric UX while keeping the existing route structure (`/orders`, `/orders/new`, `/orders/:id`, `/orders/:id/edit`).

## Status Flow (Unchanged)

```
Pending (5) ──confirm──► Processing (10) ◄──requestChanges── Revision (15)
  │  (edit)                    │  (allocated)                   │  (edit)
  ├──cancel──┐                 │                                │
  │           ├──► Cancelled (25) ◄─────────────────────────────┘
  │           │                 │
  └───────────┘                 ├──complete──► Completed (20) ──return→ Returns
                                │  (allocated)
                                └──cancel──┐
                                           │
              RevisionPending (30) ◄───────┘
```

All existing states are preserved. Only Presentation / UX changes.

---

## File-by-File Changes

### 1. `models/order-actions.ts`

**Changes:**
- Update `canRequestRevision()` to require `order.orderAllocated === true`
- Add `orderStatusEmoji()` — returns ⏳ 🔧 ✏️ ✅ ❌ for each status
- Add `orderStatusSeverity()` — centralized severity mapping for status tags
- Add `orderStatusUserLabel()` — emoji-enriched user-friendly labels:
  - Pending → `"⏳ Awaiting confirmation"`
  - Processing → `"🔧 Order in progress"`
  - Revision → `"✏️ Revision requested"`
  - Completed → `"✅ Delivered & complete"`
  - Cancelled → `"❌ Cancelled"`
  - RevisionPending → `"⏳ Revision pending"`
- Add `getBeatingAction(order)` — returns which action should have the pulsing heartbeat animation:
  - Pending → `accept` (waiting for confirmation)
  - Processing (allocated) → `complete` (ready to complete)
  - Processing (allocated, canRequestRevision) → `requestRevision` (ready for changes)
  - Revision → `accept` (ready to re-confirm)
  - Others → `null`
- Add `beat?: boolean` to `OrderActionUiMeta` for optional pulsing animation

### 2. `components/order-progress/` (NEW)

**Files:** `order-progress.component.ts`, `order-progress.component.html`

A visual horizontal timeline showing the order journey:

```
○ Pending ─── ● Processing ─── ○ Completed
```

- Current step is highlighted with primary color and pulsing dot
- Completed steps show checkmark
- Future steps are muted/grey
- Animated line between steps

**Inputs:** `status: OrderStatus`, `allocated: boolean`

### 3. `components/order-dialog/order-dialog.component.ts`

**Changes:**
- Simplify to a single-page form (no stepper)
- Compact layout: customer autocomplete + payment type + product search + items table
- Remove date picker, remove review section
- Add emoji to dialog header: "🛒 Create Order"
- Add inline validation with playful messages
- Add `@keyframes pulse-beat` animation style

### 4. `components/order-dialog/order-dialog.component.html`

**Changes:**
- Remove date picker section
- Simplify item add form (less padding, more compact)
- Remove "Order Date" reference
- Add emoji icons next to field labels
- Cleaner footer with beat animation on submit
- Total at bottom with emoji "💰 Total"

### 5. `components/order-form/order-form.component.ts`

**Changes:**
- Remove Review step (step 3) — keep only Details (1) and Items (2)
- Rename "Details" → "Customer & Payment"
- Simplify validation messages with emojis
- Add emoji labels to step headers

### 6. `components/order-form/order-form.component.html`

**Changes:**
- Remove Review step panel and template
- Update step labels with emojis: "📋 Customer & Payment", "📦 Items"
- Remove `#reviewBody`, `#orderReviewStep` templates
- Update footer buttons (from "Review" → directly "Create Order")
- In Edit mode: keep Details + Items tabs but simplified

### 7. `components/order-header/order-header.component.ts`

**Changes:**
- Update description: `'Manage and track your customer orders and status updates. 📋'`
- No structural changes

### 8. `components/order-list/order-list.component.html`

**Changes:**
- Status column: show emoji + label (e.g., "⏳ Awaiting confirmation")
- Status tag uses `orderStatusSeverity()` for color
- Row hover animation (subtle scale/translate)
- Empty state: "📭 No orders found" with emoji

### 9. `components/order-summary-card/order-summary-card.component.ts`

**Changes:**
- Replace manual `statusSeverity()` with imported `orderStatusSeverity()`
- Add `statusEmoji` getter
- Add `progressPercent` computed — percentage through the flow:
  - Pending: 25%, Processing: 50%, Completed: 100%, etc.

### 10. `components/order-summary-card/order-summary-card.component.html`

**Changes:**
- Status header shows emoji + label: `"⏳ Awaiting confirmation"`
- Add progress bar under status (using `<p-progressBar>` or custom div)
- Simplify financial card boxes (6 → 3 main: Total, Paid, Outstanding)
- Remove verbose descriptions from each box
- Keep balance check but make it more compact

### 11. `components/order-details-overview-tab/*`

**Changes:**
- Add `<app-order-progress>` component at top
- Keep customer info card
- Remove duplicate financial info (moved to summary-card)
- Add order timeline/milestones

### 12. `components/order-details-payment-tab/*`

**Changes:**
- Merge return items functionality into this tab
- Add an "accordion" or toggleable section: "📦 Return Items" that shows the return items table + "Record Return" button
- Import and use sub-components from `order-details-return-items-tab` logic
- Remove the "Payment history" table if no payments exist (show empty state with emoji)

### 13. `components/order-details-return-items-tab/*`

**DELETE** these files. Functionality merged into `order-details-payment-tab`.

### 14. `pages/order-form-page/order-form-page.component.ts`

**Changes:**
- Add `@Component` styles for `.beating-icon` animation
- Update submit validation messages with emojis
- Add playful success toast: `"🎉 Order created successfully!"`
- Add `onCreateFromDialog()` method for dialog-based creation
- Keep full-page for edit mode (still needed for complex edits)

### 15. `pages/order-form-page/order-form-page.component.html`

**Changes:**
- Add emoji to page title: `"📝 Create Order"` / `"✏️ Edit Order"`
- Remove "Back to Orders" button (dialog has its own cancel)

### 16. `pages/orders-page/orders-page.component.ts`

**Changes:**
- Import `OrderDialogComponent`
- Add `createDialogVisible` signal
- Add `onQuickCreate()` method that opens the dialog
- Add `onDialogOrderCreated(result)` to refresh list
- Inject necessary services for dialog creation (customer search, product search)

### 17. `pages/orders-page/orders-page.component.html`

**Changes:**
- Add a FAB (Floating Action Button) or prominent quick-create button
- Wire up `<app-order-dialog>` for quick creation
- Show emoji in empty state

### 18. `pages/order-details-page/order-details-page.component.ts`

**Changes:**
- Add confetti animation via CSS keyframes (triggered on complete action success)
- Import `getBeatingAction()` — compute which button should pulse
- Add `beatingAction` computed signal for the pulsing button
- Reduce tabs: add `activeTab` mapping for 3 tabs (Overview=0, LineItems=1, Payment&Returns=2)
- Map `'returnItems'` action to `payment` tab slug instead of separate tab
- Update success messages with emojis: `"🎉 Order completed successfully!"`
- Update confirmation dialog messages with emojis

### 19. `pages/order-details-page/order-details-page.component.html`

**Changes:**
- 3 tabs: Overview, Line Items, Payment & Returns
- Remove the separate "Return items" p-tab
- Add pulsing animation class to the beating action button
- Add `<app-order-progress>` to the header area
- Update status display with emoji

### 20. `components/order-reason-dialog/order-reason-dialog.component.ts`

**Changes:**
- Update header text with emoji: `"🤔 Why are you..."`
- Update button labels with emojis: `"✅ Confirm Cancellation"`
- Update placeholder: `"Please provide a reason... 📝"`

### 21. `services/order-action.facade.ts`

**Changes:**
- No code changes needed (labels come from `ORDER_ACTION_UI` now)

### 22. `orders.routes.ts`

**Changes:**
- No changes needed (routes stay the same)

---

## Animation / Beating Icon Implementation

Add these styles globally or to component styles:

```css
@keyframes pulse-beat {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--p-primary-400), 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(var(--p-primary-400), 0); }
}

.pulse-beat {
  animation: pulse-beat 1.5s ease-in-out infinite;
}
```

Applied via `[class.pulse-beat]="beatingAction() === action"` on action buttons.

## Confetti on Complete

Simple CSS-based confetti burst — 20 colored squares that fly out from the complete button and fade, triggered on successful completion action.

---

## Verification

After implementation:
1. `npm run build` (no errors)
2. `npx vitest run` (all tests pass — update test fixtures for new action labels if needed)
3. Manual check: all 4 status flows work, dialog create works, beating animation shows on correct actions

# Financial Advisor & Tracker - Project TODO

## Core Features

### Dashboard & Overview
- [x] User dashboard with financial overview
- [x] Display total savings, expenses, and investment portfolio value
- [x] Quick stats and summary cards

### Expense Tracking
- [x] Expense tracking system with categorization
- [x] Daily, weekly, and monthly breakdown views
- [x] Transaction logging with date, amount, category, and description
- [x] Category management system for expenses and income

### Investment Portfolio
- [x] Investment portfolio manager
- [x] Support for stocks, crypto, and other asset types
- [x] Current value tracking for each asset
- [ ] Real-time market data integration for stocks and crypto
- [x] Automatic portfolio value updates with gains/losses calculation

### Savings & Budget Management
- [x] Savings goals feature with targets and progress tracking
- [x] Visual progress indicators for savings goals
- [x] Budget management tools with spending limits by category
- [x] Budget period configuration (daily, weekly, monthly)

### Financial Insights & Advisor
- [ ] Data visualization with charts and graphs
- [ ] Expense trend analysis
- [ ] Investment performance visualization
- [x] LLM-based financial advisor
- [x] Spending pattern analysis
- [x] Investment recommendations based on transaction history

### Notifications & Alerts
- [ ] Notification system for budget limit exceeded alerts
- [ ] Savings goal achievement notifications
- [ ] Portfolio value change notifications
- [ ] Significant market movement alerts

### UI/UX
- [x] Cyberpunk aesthetic implementation
- [x] Deep black background with neon pink and cyan typography
- [x] Bold geometric sans-serif fonts with neon glow effects
- [x] HUD-style elements with technical lines and corner brackets
- [x] Responsive design for various screen sizes

## Technical Implementation

### Database Schema
- [x] Users table (already exists)
- [x] Transactions table
- [x] Categories table
- [x] Investments table
- [x] Savings goals table
- [x] Budget table
- [x] Notifications table

### Backend APIs
- [x] Expense tracking procedures
- [x] Investment portfolio procedures
- [x] Savings goals procedures
- [x] Budget management procedures
- [x] Financial advisor LLM integration
- [ ] Market data fetching procedures
- [x] Notification procedures

### Frontend Components
- [x] Dashboard layout with sidebar navigation
- [x] Expense tracking UI
- [x] Investment portfolio UI
- [x] Savings goals UI
- [x] Budget management UI
- [ ] Charts and visualizations
- [x] Financial advisor chat interface
- [ ] Notification center

### Testing
- [x] Unit tests for backend procedures (30 tests passing)
- [ ] Integration tests for key workflows

## Completed Items
(None yet)


## Bug Fixes

- [x] Fix 404 page navigation issues
- [ ] Fix form inputs not accepting data (need to add form handlers)
- [x] Fix login/authentication flow (working via DashboardLayout)
- [x] Ensure all pages are accessible from navigation

## Form Input Features (PRIORITY)

- [x] Add transaction input form (salary, expenses)
- [x] Add investment input form (stocks, crypto)
- [x] Add savings goal input form
- [ ] Add budget input form
- [x] Connect forms to backend mutations
- [x] Add success/error notifications

## User Requests

- [x] Add delete transaction button to transaction list

- [x] Fix category dropdown to show predefined options (Savings, Investment, Expense, etc.)

- [x] Auto-create Savings Goal entry when "Savings" transaction is added (editable from Savings Goals page)
- [ ] Auto-create Investment entry when "Investment" transaction is added (editable from Investments page)

- [x] When creating Savings Goal, set current amount from user input (progress shows correctly)
- [x] Add delete button to Savings Goals page
- [x] Add delete button to Investments page
- [x] Fix savings goal progress display to show current amount correctly

- [x] Fix budget creation form - add working inputs and submit handler
- [x] Add delete button to budgets with confirmation dialog


## Phase 11: Unified Input & Modern Theme

- [x] Create unified transaction input modal/form
- [x] Add transaction type selector (Expense, Income, Investment, Savings, Budget)
- [x] Smart auto-routing: transaction type determines where data goes
- [x] Update theme from cyberpunk/neon to modern aesthetic
- [x] Simplify color palette (remove neon pink/cyan, use modern colors)
- [x] Update typography and spacing for modern look
- [ ] Update all pages with new theme (Dashboard done, others pending)
- [x] Test smart routing on all transaction types


## Bug Fixes - Phase 12

- [x] Fix: Savings goal target not updating when "Savings" category transaction is added

- [x] Add savings goals as category options in transaction form
- [x] Link transactions to specific savings goals for updates
- [x] Remove auto-refresh on app load


## Phase 13: Dangerous Reset Feature

- [x] Add "Reset All Data" button to settings/dashboard
- [x] First confirmation dialog warning about data loss
- [x] Second confirmation dialog with FINAL WARNING
- [x] Delete all transactions, investments, goals, budgets on confirm
- [x] Show success message after reset

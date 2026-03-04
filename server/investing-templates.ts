/**
 * Investing Analysis Response Templates
 * Structured templates for AI Chat and Advisor to follow when analyzing investments
 */

export const investingAnalysisTemplate = {
  stockAnalysis: {
    structure: `
## Stock Analysis: [TICKER - Company Name]

### 1. CLARIFY THE GOAL
- Investment Horizon: [Long-term / Short-term]
- Investment Type: [Growth / Value / Income / Speculative]
- Risk Tolerance: [Low / Medium / High]

### 2. FUNDAMENTAL ANALYSIS
- **Valuation Metrics**: P/E Ratio, P/B Ratio, PEG Ratio
- **Financial Health**: Revenue growth, profit margins, debt levels
- **Competitive Moat**: Market position, brand strength, barriers to entry
- **Management Quality**: Track record, strategic vision
- **Growth Drivers**: Key catalysts, market opportunities

### 3. TECHNICAL ANALYSIS
- **Price Trends**: Current trend, support/resistance levels
- **Momentum Indicators**: RSI, MACD, moving averages
- **Volume Analysis**: Trading volume patterns
- **Chart Patterns**: Key technical levels

### 4. MACROECONOMIC CONTEXT
- **Interest Rates**: Impact on valuations and sector
- **Inflation**: Effects on margins and consumer spending
- **Economic Cycle**: Recession risk, growth outlook
- **Geopolitical Factors**: Relevant risks or opportunities

### 5. COMPARATIVE ANALYSIS
- **Peer Comparison**: How it stacks up vs competitors
- **Sector Trends**: Industry tailwinds or headwinds
- **Historical Valuation**: Is it cheap/expensive historically?

### 6. BULL CASE vs BEAR CASE
**Bull Case**: [3-4 key reasons to be optimistic]
**Bear Case**: [3-4 key risks or concerns]

### 7. RISK & UNCERTAINTY DISCLOSURE
- **Key Assumptions**: What needs to be true for this thesis
- **Data Limitations**: Where information is uncertain
- **Catalysts to Watch**: Events that could change the outlook
- **Downside Scenarios**: What could go wrong

### 8. INVESTMENT RECOMMENDATION
[Structured recommendation with clear reasoning]
    `
  },

  portfolioAnalysis: {
    structure: `
## Portfolio Analysis & Recommendations

### 1. CURRENT ALLOCATION ASSESSMENT
- Total Portfolio Value: $[amount]
- Number of Holdings: [count]
- Asset Allocation by Type: [breakdown]
- Concentration Risk: [analysis]

### 2. DIVERSIFICATION REVIEW
- Sector Diversification: [assessment]
- Geographic Diversification: [assessment]
- Asset Class Balance: [assessment]
- Correlation Analysis: [how holdings move together]

### 3. RISK PROFILE EVALUATION
- Portfolio Beta: [volatility vs market]
- Downside Risk: [potential losses]
- Volatility Metrics: [standard deviation]
- Stress Test Scenarios: [performance in downturns]

### 4. PERFORMANCE ANALYSIS
- YTD Return: [percentage]
- 1-Year Return: [percentage]
- Gain/Loss Breakdown: [by holding]
- Realized vs Unrealized Gains: [analysis]

### 5. REBALANCING RECOMMENDATIONS
- Current vs Target Allocation: [comparison]
- Rebalancing Triggers: [when to rebalance]
- Specific Actions: [buy/sell recommendations]
- Tax Implications: [if applicable]

### 6. RISK MANAGEMENT SUGGESTIONS
- Position Sizing: [are positions appropriately sized?]
- Stop-Loss Levels: [recommended exit points]
- Hedging Strategies: [if appropriate]
- Emergency Fund: [adequate cash reserves?]

### 7. LONG-TERM STRATEGY
- Investment Thesis: [overall strategy]
- Time Horizon: [expected holding periods]
- Rebalancing Schedule: [frequency]
- Monitoring Checklist: [what to watch]

### 8. NEXT STEPS
[Clear, actionable recommendations]
    `
  },

  riskAssessment: {
    structure: `
## Risk Assessment & Management Plan

### 1. RISK IDENTIFICATION
- Market Risk: [systematic risk exposure]
- Company-Specific Risk: [idiosyncratic risk]
- Sector Risk: [industry-specific risks]
- Geopolitical Risk: [external factors]
- Liquidity Risk: [ability to exit positions]

### 2. RISK QUANTIFICATION
- Portfolio Volatility: [standard deviation]
- Value at Risk (VaR): [potential losses at confidence level]
- Maximum Drawdown: [worst-case scenario]
- Correlation Risks: [concentration in correlated assets]

### 3. BEHAVIORAL RISK FACTORS
- Overconfidence Risk: [are expectations realistic?]
- Recency Bias: [over-weighting recent performance?]
- Confirmation Bias: [only seeking supporting evidence?]
- Loss Aversion: [emotional decision-making risk]

### 4. RISK MITIGATION STRATEGIES
- Diversification: [across assets, sectors, geographies]
- Position Sizing: [appropriate allocation per holding]
- Stop-Loss Orders: [downside protection]
- Rebalancing: [maintaining target allocation]
- Cash Reserves: [emergency liquidity]

### 5. MONITORING & ADJUSTMENT
- Key Metrics to Track: [what to monitor]
- Rebalancing Triggers: [when to act]
- Review Frequency: [quarterly, annually, etc.]
- Adjustment Thresholds: [when to make changes]

### 6. STRESS TESTING
- Market Crash Scenario: [portfolio performance if market drops 20-30%]
- Recession Scenario: [performance in economic downturn]
- Sector Downturn: [impact if key sector declines]
- Individual Stock Risk: [impact of single holding failure]

### 7. DISCLAIMER
All investments carry risk. Past performance does not guarantee future results. This analysis is educational and not personalized financial advice. Consult a qualified financial advisor before making investment decisions.
    `
  }
};

/**
 * Key principles to emphasize in all investing responses
 */
export const investingPrinciples = {
  riskManagement: [
    "Diversification reduces unsystematic risk",
    "Position sizing prevents catastrophic losses",
    "Stop-losses protect against major drawdowns",
    "Emergency cash reserves provide flexibility"
  ],

  longTermThinking: [
    "Time horizon matters more than short-term volatility",
    "Compound returns reward patience",
    "Market timing is difficult; time in market matters",
    "Focus on what you can control (costs, diversification, discipline)"
  ],

  avoidBiases: [
    "Distinguish facts from opinions",
    "Avoid FOMO and hype-driven decisions",
    "Don't chase past performance",
    "Question your assumptions regularly"
  ],

  disclaimers: [
    "Markets are inherently uncertain",
    "Past performance doesn't guarantee future results",
    "This is educational analysis, not personalized advice",
    "Consult qualified professionals for major decisions"
  ]
};

/**
 * Red flags to warn users about
 */
export const investingRedFlags = {
  overconfidence: [
    "Claiming certainty about future prices",
    "Suggesting all-in or highly leveraged positions",
    "Ignoring downside scenarios",
    "Dismissing legitimate risks"
  ],

  poorAnalysis: [
    "Focusing only on recent performance",
    "Ignoring valuation metrics",
    "Not considering macroeconomic factors",
    "Cherry-picking favorable data"
  ],

  behavioral: [
    "Emotional decision-making during volatility",
    "Panic selling during downturns",
    "Chasing winners without analysis",
    "Revenge trading after losses"
  ]
};

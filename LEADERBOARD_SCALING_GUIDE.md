# Leaderboard Scaling Guide

## 🚀 Scaling Strategy for Large Datasets

This guide provides a comprehensive approach to scale the leaderboard system to handle millions of transactions efficiently.

## 📊 Performance Benchmarks

### Current Performance (Before Optimization)
- **10K transactions**: ~500ms query time
- **100K transactions**: ~2-5 seconds
- **1M+ transactions**: 10-30 seconds (timeout risk)

### Target Performance (After Optimization)
- **10K transactions**: ~50ms query time
- **100K transactions**: ~200ms query time
- **1M+ transactions**: ~500ms query time
- **10M+ transactions**: ~1-2 seconds (with caching)

## 🔧 Implementation Steps

### Phase 1: Database Optimization (Immediate - 1-2 days)

#### 1.1 Critical Indexes
```sql
-- Essential composite index for leaderboard queries
CREATE INDEX idx_transactions_leaderboard_performance 
ON sl_transactions (type, created_at, to_user_id, amount);

-- Date range optimization
CREATE INDEX idx_transactions_date_type 
ON sl_transactions (created_at, type);

-- User-based queries
CREATE INDEX idx_transactions_user_amount 
ON sl_transactions (to_user_id, amount DESC);

-- Active users filter
CREATE INDEX idx_users_active 
ON sl_user_accounts (is_active, user_id);
```

#### 1.2 Run Optimization Script
```bash
# Install Redis if not already installed
npm install ioredis

# Run the optimization script
node src/scripts/optimizeLeaderboardPerformance.js
```

### Phase 2: Caching Implementation (1 week)

#### 2.1 Redis Setup
```javascript
// Add to your environment variables
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

#### 2.2 Cache Strategy
- **Cache Duration**: 5 minutes for real-time data
- **Cache Keys**: `leaderboard:weekly`, `leaderboard:monthly`, `leaderboard:alltime`
- **Fallback**: Direct database query if cache fails

### Phase 3: Advanced Scaling (2-4 weeks)

#### 3.1 Materialized Views
```sql
-- Create materialized view for leaderboard data
CREATE TABLE leaderboard_cache (
  period VARCHAR(20),
  user_id VARCHAR(36),
  total_points INT,
  rank_position INT,
  last_updated TIMESTAMP,
  PRIMARY KEY (period, user_id),
  INDEX idx_period_rank (period, rank_position)
);
```

#### 3.2 Database Partitioning
```sql
-- Partition transactions table by date
ALTER TABLE sl_transactions 
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2020 VALUES LESS THAN (2021),
  PARTITION p2021 VALUES LESS THAN (2022),
  PARTITION p2022 VALUES LESS THAN (2023),
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

## 📈 Scaling Levels

### Level 1: Small Scale (1K-10K users, 100K transactions)
**Requirements:**
- Basic indexes
- 5-minute caching
- Standard database

**Performance:** 50-200ms queries

### Level 2: Medium Scale (10K-100K users, 1M transactions)
**Requirements:**
- All optimized indexes
- Redis caching
- Materialized views
- Query optimization

**Performance:** 200-500ms queries

### Level 3: Large Scale (100K+ users, 10M+ transactions)
**Requirements:**
- Database partitioning
- Read replicas
- Advanced caching strategies
- Background job processing

**Performance:** 500ms-2s queries

### Level 4: Enterprise Scale (1M+ users, 100M+ transactions)
**Requirements:**
- Database sharding
- Microservices architecture
- CDN for static data
- Real-time streaming

**Performance:** 1-3s queries with real-time updates

## 🛠️ Implementation Code

### Optimized Leaderboard Query
```javascript
// Efficient subquery approach
const getOptimizedLeaderboard = async (period, currentUserId, page, limit) => {
  const startDate = getPeriodStartDate(period);
  const offset = (page - 1) * limit;
  
  // Pre-filter and aggregate transactions
  const userTotalsSubquery = db('sl_transactions')
    .select('to_user_id')
    .sum('amount as totalPoints')
    .whereIn('type', ['received', 'earned'])
    .where('created_at', '>=', startDate)
    .groupBy('to_user_id')
    .having('totalPoints', '>', 0)
    .orderBy('totalPoints', 'desc')
    .as('user_totals');

  // Main query with optimized joins
  return await db('sl_user_accounts')
    .join(userTotalsSubquery, 'sl_user_accounts.user_id', 'user_totals.to_user_id')
    .select(/* fields */)
    .where('sl_user_accounts.is_active', true)
    .orderBy('user_totals.totalPoints', 'desc')
    .limit(limit)
    .offset(offset);
};
```

### Caching Implementation
```javascript
const getCachedLeaderboard = async (period, currentUserId) => {
  const cacheKey = `leaderboard:${period}`;
  const cacheTTL = 300; // 5 minutes

  try {
    // Check cache first
    if (global.redis) {
      const cached = await global.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // Get fresh data
    const data = await getOptimizedLeaderboard(period, currentUserId, 1, 50);
    
    // Cache the result
    if (global.redis) {
      await global.redis.setex(cacheKey, cacheTTL, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    // Fallback to direct query
    return await getOptimizedLeaderboard(period, currentUserId, 1, 50);
  }
};
```

## 📊 Monitoring and Alerts

### Performance Monitoring
```javascript
// Add to your application
const logSlowQuery = (query, duration) => {
  if (duration > 1000) {
    console.warn(`Slow query detected: ${duration}ms`, query);
    // Send alert to monitoring system
  }
};
```

### Database Monitoring Queries
```sql
-- Check for slow queries
SHOW PROCESSLIST;

-- Monitor index usage
SHOW INDEX FROM sl_transactions;

-- Check table sizes
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = DATABASE()
  AND table_name LIKE 'sl_%';
```

## 🔄 Maintenance Tasks

### Daily Tasks
- Monitor query performance
- Check cache hit rates
- Review error logs

### Weekly Tasks
- Update leaderboard cache
- Analyze slow queries
- Review database size growth

### Monthly Tasks
- Optimize indexes based on usage
- Review and adjust cache strategies
- Plan for capacity increases

## 🚨 Troubleshooting

### Common Issues

#### 1. Slow Queries
**Symptoms:** Query times > 2 seconds
**Solutions:**
- Check if indexes are being used: `EXPLAIN SELECT ...`
- Add missing indexes
- Optimize query structure

#### 2. Cache Misses
**Symptoms:** High cache miss rate
**Solutions:**
- Increase cache TTL
- Add more cache keys
- Implement cache warming

#### 3. Database Connection Issues
**Symptoms:** Connection timeouts
**Solutions:**
- Increase connection pool size
- Add database read replicas
- Implement connection retry logic

### Performance Checklist
- [ ] All critical indexes created
- [ ] Redis caching implemented
- [ ] Query performance < 1 second
- [ ] Cache hit rate > 80%
- [ ] Database size monitored
- [ ] Error rates < 1%

## 📈 Expected Results

### Before Optimization
- 1M transactions: 10-30 seconds
- High database CPU usage
- Potential timeouts

### After Optimization
- 1M transactions: 200-500ms
- Low database CPU usage
- Reliable response times
- Scalable to 10M+ transactions

## 🎯 Success Metrics

- **Query Time**: < 1 second for 1M transactions
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%
- **Database CPU**: < 70% average
- **Response Time**: 99th percentile < 2 seconds

This scaling strategy ensures your leaderboard system can handle growth from thousands to millions of users while maintaining excellent performance. 
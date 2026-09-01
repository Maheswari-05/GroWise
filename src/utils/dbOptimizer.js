/**
 * Database Optimization Utilities
 * Reduces API calls and manages data cleanup for Supabase free tier
 */

import supabase from '../lib/supabase';

/**
 * Cleanup old notifications (keep only last 30 days)
 */
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) {
      console.warn('Cleanup notifications failed:', error);
      return false;
    }
    console.log('✅ Old notifications cleaned');
    return true;
  } catch (e) {
    console.warn('Cleanup error:', e);
    return false;
  }
}

/**
 * Cleanup old attendance logs (keep only last 90 days)
 */
export async function cleanupOldAttendanceLogs() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { error } = await supabase
      .from('attendance_logs')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString());

    if (error) {
      console.warn('Cleanup attendance failed:', error);
      return false;
    }
    console.log('✅ Old attendance logs cleaned');
    return true;
  } catch (e) {
    console.warn('Cleanup error:', e);
    return false;
  }
}

/**
 * Cleanup completed old assignments (keep only last 60 days)
 */
export async function cleanupOldAssignments() {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('status', 'completed')
      .lt('created_at', sixtyDaysAgo.toISOString());

    if (error) {
      console.warn('Cleanup assignments failed:', error);
      return false;
    }
    console.log('✅ Old assignments cleaned');
    return true;
  } catch (e) {
    console.warn('Cleanup error:', e);
    return false;
  }
}

/**
 * Run all cleanup tasks
 */
export async function runDatabaseCleanup() {
  console.log('🧹 Starting database cleanup...');
  
  const results = await Promise.all([
    cleanupOldNotifications(),
    cleanupOldAttendanceLogs(),
    cleanupOldAssignments()
  ]);

  const successCount = results.filter(Boolean).length;
  console.log(`✅ Database cleanup completed: ${successCount}/3 tasks successful`);
  
  return successCount === 3;
}

/**
 * Debounce function to reduce API calls
 */
export function debounce(func, wait = 1000) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create optimized realtime channel with automatic cleanup
 * Reduces connection overhead by reusing channels
 */
const activeChannels = new Map();

export function createOptimizedChannel(channelName, config) {
  // Reuse existing channel if already subscribed
  if (activeChannels.has(channelName)) {
    console.log(`♻️ Reusing channel: ${channelName}`);
    return activeChannels.get(channelName);
  }

  const channel = supabase.channel(channelName);
  
  // Add event listeners from config
  if (config.onInsert) {
    channel.on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: config.table }, 
      config.onInsert
    );
  }
  if (config.onUpdate) {
    channel.on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: config.table }, 
      config.onUpdate
    );
  }
  if (config.onDelete) {
    channel.on('postgres_changes', 
      { event: 'DELETE', schema: 'public', table: config.table }, 
      config.onDelete
    );
  }
  if (config.onChange) {
    channel.on('postgres_changes', 
      { event: '*', schema: 'public', table: config.table }, 
      config.onChange
    );
  }

  channel.subscribe();
  activeChannels.set(channelName, channel);
  
  return channel;
}

/**
 * Remove and cleanup a channel
 */
export function removeOptimizedChannel(channelName) {
  const channel = activeChannels.get(channelName);
  if (channel) {
    supabase.removeChannel(channel);
    activeChannels.delete(channelName);
    console.log(`🗑️ Removed channel: ${channelName}`);
  }
}

/**
 * Batch fetch with pagination to reduce single large queries
 */
export async function batchFetch(table, options = {}) {
  const { 
    limit = 100, 
    orderBy = 'created_at', 
    ascending = false,
    filters = {}
  } = options;

  let query = supabase
    .from(table)
    .select('*')
    .order(orderBy, { ascending })
    .limit(limit);

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) {
    console.error(`Batch fetch error for ${table}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Check database quota usage (for monitoring)
 */
export async function checkDatabaseUsage() {
  try {
    // This is an estimate based on record counts
    const tables = ['students', 'teachers', 'admins', 'batches', 'subjects', 
                    'assignments', 'weekly_tests', 'materials', 'notifications', 
                    'attendance_logs', 'online_classes'];
    
    const counts = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        return { table, count: error ? 0 : count };
      })
    );

    const totalRecords = counts.reduce((sum, { count }) => sum + count, 0);
    console.log('📊 Database usage:', counts);
    console.log('📊 Total records:', totalRecords);
    
    return { tables: counts, total: totalRecords };
  } catch (e) {
    console.warn('Could not check database usage:', e);
    return null;
  }
}

// Auto cleanup on app initialization (once per day)
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
let cleanupInterval = null;

export function startAutoCleanup() {
  if (cleanupInterval) return; // Already running

  // Run immediately
  runDatabaseCleanup();

  // Then run every 24 hours
  cleanupInterval = setInterval(() => {
    runDatabaseCleanup();
  }, CLEANUP_INTERVAL);

  console.log('🤖 Auto-cleanup scheduled (every 24 hours)');
}

export function stopAutoCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('🛑 Auto-cleanup stopped');
  }
}

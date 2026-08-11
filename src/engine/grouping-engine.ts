import type { GroupBy, NormalizedActivity } from '../types';
import {
  addChronologicalBucket,
  chronologicalBucketKey,
  chronologicalBucketLabel,
  isChronologicalGroup,
  startOfChronologicalBucket,
} from '../utils/dates';

export interface ActivityGroup {
  key: string;
  label: string;
  sortKey: string;
  activities: NormalizedActivity[];
}

function nonChronologicalValue(activity: NormalizedActivity, groupBy: GroupBy): string {
  switch (groupBy) {
    case 'account':
      return activity.accountName || activity.accountId;
    case 'instrument':
      return activity.instrument;
    case 'type':
      return activity.effectiveType;
    case 'currency':
      return activity.currency;
    default:
      return '';
  }
}

export function groupActivities(activities: NormalizedActivity[], groupBy?: GroupBy): ActivityGroup[] {
  if (!groupBy) {
    return [{ key: 'all', label: 'All activities', sortKey: 'all', activities }];
  }

  const groups = new Map<string, ActivityGroup>();
  for (const activity of activities) {
    const key = isChronologicalGroup(groupBy)
      ? chronologicalBucketKey(activity.date, groupBy)
      : nonChronologicalValue(activity, groupBy);
    const label = isChronologicalGroup(groupBy)
      ? chronologicalBucketLabel(activity.date, groupBy)
      : key || 'Unknown';
    const existing = groups.get(key);
    if (existing) existing.activities.push(activity);
    else groups.set(key, { key, label, sortKey: key, activities: [activity] });
  }
  return [...groups.values()].sort((left, right) => left.sortKey.localeCompare(right.sortKey));
}

export function chronologicalKeys(
  activities: NormalizedActivity[],
  groupBy: Extract<GroupBy, 'day' | 'week' | 'month' | 'quarter' | 'year'>,
): Array<{ key: string; label: string; sortKey: string }> {
  if (activities.length === 0) return [];
  const timestamps = activities.map((activity) => activity.date.getTime());
  let cursor = startOfChronologicalBucket(new Date(Math.min(...timestamps)), groupBy);
  const last = startOfChronologicalBucket(new Date(Math.max(...timestamps)), groupBy);
  const keys: Array<{ key: string; label: string; sortKey: string }> = [];
  while (cursor <= last) {
    const key = chronologicalBucketKey(cursor, groupBy);
    keys.push({ key, label: chronologicalBucketLabel(cursor, groupBy), sortKey: key });
    cursor = addChronologicalBucket(cursor, groupBy);
  }
  return keys;
}

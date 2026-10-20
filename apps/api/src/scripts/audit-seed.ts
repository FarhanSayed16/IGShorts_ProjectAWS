import path from 'path';
import { ManualSeedAdapter, SeedRowParsed } from '../ingestion/adapters/manual-seed.adapter.js';

const adapter = new ManualSeedAdapter();
const excelPath = path.resolve(
  process.cwd(),
  'docs/IGshorts_Instagram_Account_Research_and_Architecture.xlsx',
);

console.log('=== SEED DATA AUDIT ===');
const result = adapter.parseExcelFile(excelPath);

console.log(`India Rows: ${result.indiaRows.length}`);
console.log(`Global Rows: ${result.globalRows.length}`);
console.log(`Total Parsed Rows: ${result.totalParsed}`);
console.log(`Invalid / Bad Usernames Count: ${result.badUsernames.length}`);
if (result.badUsernames.length > 0) {
  console.log(`Bad Usernames:`, result.badUsernames);
}

// Deduplicate rows across sheets by username
const profileMap = new Map<string, SeedRowParsed & { scopes: string[] }>();

for (const row of [...result.indiaRows, ...result.globalRows]) {
  if (!row.username) continue;
  if (!profileMap.has(row.username)) {
    profileMap.set(row.username, { ...row, scopes: [row.scope] });
  } else {
    const existing = profileMap.get(row.username)!;
    if (!existing.scopes.includes(row.scope)) {
      existing.scopes.push(row.scope);
    }
  }
}

const uniqueProfiles = Array.from(profileMap.values());
console.log(`Unique Deduplicated Profiles: ${uniqueProfiles.length}`);

// Breakdown by Entity Type
const entityBreakdown: Record<string, number> = {};
const categoryBreakdown: Record<string, number> = {};
let withFollowers = 0;
let withoutFollowers = 0;

for (const p of uniqueProfiles) {
  entityBreakdown[p.entityType] = (entityBreakdown[p.entityType] || 0) + 1;
  const cat = p.category || 'NO_CATEGORY';
  categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  if (p.followerCount !== null) {
    withFollowers++;
  } else {
    withoutFollowers++;
  }
}

console.log('\n--- Breakdown by Entity Type ---');
console.table(entityBreakdown);

console.log('\n--- Breakdown by Category ---');
console.table(categoryBreakdown);

console.log('\n--- Follower Count Status ---');
console.log(`With Verified Count: ${withFollowers}`);
console.log(`Pending / Null Count: ${withoutFollowers}`);

console.log('\n--- Non-Person Profiles (Brands / Teams / Platforms / Other) ---');
const nonPersons = uniqueProfiles.filter((p) => p.entityType !== 'person');
console.log(`Count: ${nonPersons.length}`);
for (const np of nonPersons) {
  console.log(
    `- @${np.username} | "${np.displayName}" | Type: ${np.entityType} | Cat: ${np.category} | Followers: ${np.followerCount ? Number(np.followerCount) : 'null'}`,
  );
}

console.log('\n--- Potential Misclassifications Check ---');
const suspiciousPersons = uniqueProfiles.filter((p) => {
  if (p.entityType !== 'person') return false;
  const lowerName = p.displayName.toLowerCase();
  const lowerHandle = p.username.toLowerCase();
  return (
    lowerName.includes('club') ||
    lowerName.includes('team') ||
    lowerName.includes('fc') ||
    lowerName.includes('cricket') ||
    lowerName.includes('news') ||
    lowerName.includes('tv') ||
    lowerName.includes('times') ||
    lowerName.includes('zomato') ||
    lowerName.includes('swiggy') ||
    lowerName.includes('nike') ||
    lowerName.includes('apple') ||
    lowerName.includes('netflix') ||
    lowerName.includes('national geographic') ||
    lowerName.includes('nasa') ||
    lowerHandle.includes('fc') ||
    lowerHandle.includes('cricket') ||
    lowerHandle.includes('bcci') ||
    lowerHandle.includes('ipl')
  );
});

console.log(`Suspicious Person entries found: ${suspiciousPersons.length}`);
for (const sp of suspiciousPersons) {
  console.log(
    `- @${sp.username} | "${sp.displayName}" | Cat: ${sp.category} | Current Type: ${sp.entityType}`,
  );
}

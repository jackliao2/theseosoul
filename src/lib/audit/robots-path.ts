/**
 * Simplified Google robots.txt path matching:
 * - Most specific User-agent group wins (* as fallback)
 * - Within a group, longest matching Allow/Disallow wins
 * - Equal length: Allow beats Disallow
 * - Supports * wildcard and trailing $ end-anchor
 */

export type RobotsPathRule = {
  type: "allow" | "disallow";
  pattern: string;
  line: string;
};

export type RobotsAgentGroup = {
  agents: string[];
  rules: RobotsPathRule[];
};

export type RobotsPathTest = {
  path: string;
  userAgent: string;
  allowed: boolean;
  matchedRule: RobotsPathRule | null;
  groupAgents: string[];
  usedWildcardGroup: boolean;
  message: string;
};

export const ROBOTS_TEST_AGENTS = [
  { id: "*", label: "All bots (*)" },
  { id: "Googlebot", label: "Googlebot" },
  { id: "Bingbot", label: "Bingbot" },
  { id: "GPTBot", label: "GPTBot" },
  { id: "ClaudeBot", label: "ClaudeBot" },
  { id: "Google-Extended", label: "Google-Extended" },
] as const;

export function normalizeRobotsPath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "/";

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      return `${parsed.pathname || "/"}${parsed.search}`;
    }
  } catch {
    /* fall through */
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return path || "/";
}

/** Parse User-agent groups with Allow/Disallow rules (Sitemap/others ignored). */
export function parseRobotsGroups(content: string): RobotsAgentGroup[] {
  const groups: RobotsAgentGroup[] = [];
  let agents: string[] = [];
  let rules: RobotsPathRule[] = [];
  let inRules = false;

  const pushGroup = () => {
    if (agents.length === 0) return;
    groups.push({ agents, rules });
    agents = [];
    rules = [];
    inRules = false;
  };

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const uaMatch = line.match(/^user-agent:\s*(.+)$/i);
    if (uaMatch) {
      if (inRules) {
        pushGroup();
      }
      agents.push(uaMatch[1].trim());
      continue;
    }

    const allowMatch = line.match(/^allow:\s*(.*)$/i);
    if (allowMatch) {
      if (agents.length === 0) continue;
      inRules = true;
      rules.push({
        type: "allow",
        pattern: allowMatch[1].trim(),
        line,
      });
      continue;
    }

    const disallowMatch = line.match(/^disallow:\s*(.*)$/i);
    if (disallowMatch) {
      if (agents.length === 0) continue;
      inRules = true;
      rules.push({
        type: "disallow",
        pattern: disallowMatch[1].trim(),
        line,
      });
      continue;
    }

    // Other directives (Sitemap, Host, …) close the current group.
    if (agents.length > 0) {
      pushGroup();
    }
  }

  if (agents.length > 0) {
    pushGroup();
  }

  return groups;
}

function patternToRegExp(pattern: string): RegExp {
  // Empty allow/disallow patterns are handled by caller
  let source = "";
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === "*") {
      source += ".*";
    } else if (ch === "$" && i === pattern.length - 1) {
      source += "$";
    } else if (/[.+?^${}()|[\]\\]/.test(ch)) {
      source += `\\${ch}`;
    } else {
      source += ch;
    }
    i += 1;
  }
  if (!pattern.endsWith("$")) {
    // Prefix match (Google treats patterns as path prefixes unless $)
    // already implicit: we test with ^pattern — without $ means rest can follow
  }
  return new RegExp(`^${source}`);
}

export function pathMatchesRobotsRule(pattern: string, path: string): boolean {
  if (pattern === "") return false;
  try {
    return patternToRegExp(pattern).test(path);
  } catch {
    return path.startsWith(pattern.replace(/\$$/, "").replace(/\*/g, ""));
  }
}

function pickGroup(
  groups: RobotsAgentGroup[],
  userAgent: string
): { group: RobotsAgentGroup; usedWildcardGroup: boolean } | null {
  const ua = userAgent.trim().toLowerCase();
  const specific = groups.find((g) =>
    g.agents.some((a) => a.toLowerCase() === ua)
  );
  if (specific) return { group: specific, usedWildcardGroup: false };

  if (ua === "*") {
    const star = groups.find((g) => g.agents.some((a) => a === "*"));
    return star ? { group: star, usedWildcardGroup: true } : null;
  }

  const star = groups.find((g) => g.agents.some((a) => a === "*"));
  return star ? { group: star, usedWildcardGroup: true } : null;
}

export function testRobotsPath(
  content: string,
  pathInput: string,
  userAgent: string
): RobotsPathTest {
  const path = normalizeRobotsPath(pathInput);
  const ua = userAgent.trim() || "*";
  const groups = parseRobotsGroups(content);
  const picked = pickGroup(groups, ua);

  if (!picked) {
    return {
      path,
      userAgent: ua,
      allowed: true,
      matchedRule: null,
      groupAgents: [],
      usedWildcardGroup: false,
      message: `No matching User-agent group for ${ua} — path is allowed by default.`,
    };
  }

  const { group, usedWildcardGroup } = picked;
  let best: { rule: RobotsPathRule; length: number } | null = null;

  for (const rule of group.rules) {
    // Empty Disallow means allow everything (no restriction from that line)
    if (rule.type === "disallow" && rule.pattern === "") continue;
    // Empty Allow is ignored
    if (rule.type === "allow" && rule.pattern === "") continue;
    if (!pathMatchesRobotsRule(rule.pattern, path)) continue;

    const length = rule.pattern.length;
    if (
      !best ||
      length > best.length ||
      (length === best.length &&
        rule.type === "allow" &&
        best.rule.type === "disallow")
    ) {
      best = { rule, length };
    }
  }

  if (!best) {
    return {
      path,
      userAgent: ua,
      allowed: true,
      matchedRule: null,
      groupAgents: group.agents,
      usedWildcardGroup,
      message: `No Allow/Disallow matched ${path} for ${ua} — allowed by default.`,
    };
  }

  const allowed = best.rule.type === "allow";
  return {
    path,
    userAgent: ua,
    allowed,
    matchedRule: best.rule,
    groupAgents: group.agents,
    usedWildcardGroup,
    message: allowed
      ? `${ua} is allowed to fetch ${path} (matched ${best.rule.line}).`
      : `${ua} is blocked from ${path} (matched ${best.rule.line}).`,
  };
}

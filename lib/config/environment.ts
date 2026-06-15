/**
 * Environment Configuration for PDP Lifecycle App
 */

export type Environment = 'development' | 'staging' | 'production';

const VALID_ENVIRONMENTS: readonly Environment[] = ['development', 'staging', 'production'];

/** Shorthand values seen in docs/skills — normalized before Mixpanel super-properties. */
const ENV_ALIASES: Record<string, Environment> = {
  dev: 'development',
  prod: 'production',
};

/**
 * Resolves app environment for analytics and client metadata.
 *
 * Reads `NEXT_PUBLIC_APP_ENV` first, then `NEXT_PUBLIC_ENV` (used in Vercel
 * setup docs). Without either, defaults to `development` (local).
 */
function resolveEnvironment(): Environment {
  const raw =
    process.env.NEXT_PUBLIC_APP_ENV?.trim() ||
    process.env.NEXT_PUBLIC_ENV?.trim() ||
    '';
  if (!raw) return 'development';

  const aliased = ENV_ALIASES[raw.toLowerCase()] ?? raw;
  if (VALID_ENVIRONMENTS.includes(aliased as Environment)) {
    return aliased as Environment;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[config] Unknown environment "${raw}" (NEXT_PUBLIC_APP_ENV / NEXT_PUBLIC_ENV). Using development.`
    );
  }
  return 'development';
}

const environment: Environment = resolveEnvironment();

export const config = {
  environment,
  isDevelopment: environment === 'development',
  isStaging: environment === 'staging',
  isProduction: environment === 'production',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    /** Server-only: NEVER expose to the browser (no NEXT_PUBLIC_ prefix). */
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  airtable: {
    /**
     * Server-only: NEVER expose Airtable tokens to the browser.
     */
    apiKey: process.env.AIRTABLE_API_KEY || '',
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: process.env.AIRTABLE_TABLE_NAME || 'Properties',
  },
  /** Server-only: Vercel Cron must send Authorization: Bearer <CRON_SECRET> for /api/cron/airtable-pending-validate */
  cronSecret: process.env.CRON_SECRET || '',
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
  /** n8n webhook URL for corrections notifications (server-only) */
  correctionsWebhookUrl:
    process.env.CORRECTIONS_WEBHOOK_URL ||
    "https://n8n.prod.prophero.com/webhook/bed4b456-523a-47c7-b0ca-ede3cba16ee5",
  /** n8n webhook URL for weekly flip deck digest cron (server-only). No default — unset skips POST. */
  flipDeckDigestWebhookUrl: process.env.FLIP_DECK_DIGEST_WEBHOOK_URL || "",
  /** AI Agent keys (server-only, never prefixed with NEXT_PUBLIC_) */
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  voyage: {
    apiKey: process.env.VOYAGE_API_KEY || '',
  },
  /**
   * PropHero Portfolio API (server-only). Used to fetch PDFs (e.g. nota simple)
   * stored by the Portfolio team and referenced from Airtable Properties
   * "TECH - Land registry doc (DD) (URLs)". Auth is HTTP Basic.
   * NEVER expose to the browser (no NEXT_PUBLIC_ prefix).
   */
  portfolio: {
    baseUrl: process.env.PORTFOLIO_API_BASE_URL || 'https://api.portfolio.prod.prophero.com',
    username: process.env.PORTFOLIO_API_USERNAME || '',
    password: process.env.PORTFOLIO_API_PASSWORD || '',
  },
};

/** True when Portfolio API basic-auth credentials are configured. */
export function hasPortfolioApiCredentials(): boolean {
  return Boolean(config.portfolio.username && config.portfolio.password);
}

/**
 * Validates that the Anthropic API key is present.
 * Use for pipelines that only need the LLM (FEIN / appraisal extraction, agent chat).
 */
export function validateAnthropicEnv(): void {
  if (!config.anthropic.apiKey) {
    throw new Error(
      "[Agent Config] Missing ANTHROPIC_API_KEY. " +
        "Add it to .env.local (server-only, no NEXT_PUBLIC_ prefix)."
    );
  }
}

/**
 * Validates that ALL agent API keys are present (Anthropic + Voyage).
 * Use for pipelines that also perform vector embedding / indexing.
 */
export function validateAgentEnv(): void {
  const missing: string[] = [];

  if (!config.anthropic.apiKey) missing.push("ANTHROPIC_API_KEY");
  if (!config.voyage.apiKey) missing.push("VOYAGE_API_KEY");

  if (missing.length > 0) {
    throw new Error(
      `[Agent Config] Missing required environment variables: ${missing.join(", ")}. ` +
        "Add them to .env.local (server-only, no NEXT_PUBLIC_ prefix)."
    );
  }
}

/** Server-only: Cron secret for protected cron endpoints. Throws if not configured. */
export function getCronSecret(): string {
  const val = config.cronSecret;
  if (!val) throw new Error('[Cron] Missing CRON_SECRET env var.');
  return val;
}

export function getSupabaseProjectName(): string {
  const url = config.supabase.url;
  if (!url) return 'unknown';
  try {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Static demo groups for the bulk-unassignment UI (`lib/settlement-unassigned-ui-demo.ts`).
 *
 * Use **`NEXT_PUBLIC_SETTLEMENT_UNASSIGNED_UI_DEMO=true`** in `.env.local` so the flag is
 * available in the browser (section visibility + fetch). Optional legacy:
 * `SETTLEMENT_UNASSIGNED_UI_DEMO=true` still works on the server only.
 *
 * Do not enable in production deployments.
 */
export function isSettlementUnassignedUiDemo(): boolean {
  return (
    process.env.NEXT_PUBLIC_SETTLEMENT_UNASSIGNED_UI_DEMO === 'true' ||
    process.env.SETTLEMENT_UNASSIGNED_UI_DEMO === 'true'
  );
}

/**
 * When true (default), settlement kanban and unassigned home only show properties with
 * `country = 'Spain'`. Set `SETTLEMENT_REQUIRE_SPAIN=false` (server) or
 * `NEXT_PUBLIC_SETTLEMENT_REQUIRE_SPAIN=false` (browser kanban) while backfilling country.
 */
export function isSettlementRequireSpain(): boolean {
  if (process.env.NEXT_PUBLIC_SETTLEMENT_REQUIRE_SPAIN === 'false') return false;
  if (process.env.SETTLEMENT_REQUIRE_SPAIN === 'false') return false;
  return true;
}

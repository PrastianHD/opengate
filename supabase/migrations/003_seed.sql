-- ============================================================================
-- OpenGates Stage 1 — Seed data
-- 7 providers + 12 models with pricing in micro-cents.
-- Run after 001_schema.sql + 002_rls.sql
-- ============================================================================

-- ============================================================================
-- PROVIDERS
-- ============================================================================
insert into public.providers (slug, name, base_url, adapter, priority, notes)
values
  ('kiro-dev',       'Kiro Dev',        'https://api.kiro.dev/v1',           'openai_compat', 50,  'Free tier provider, OpenAI-compatible'),
  ('opencode-free',  'OpenCode Free',   'https://api.opencode.ai/v1',        'openai_compat', 60,  'Free tier provider'),
  ('openrouter',     'OpenRouter',      'https://openrouter.ai/api/v1',      'openai_compat', 30,  'Aggregator, broad model coverage'),
  ('ollama',         'Ollama (local)',  'http://localhost:11434/v1',         'ollama',        90,  'Self-hosted local inference'),
  ('nvidia-nim',     'Nvidia NIM',      'https://integrate.api.nvidia.com/v1','nvidia_nim',  70,  'Nvidia hosted inference'),
  ('glm-official',   'GLM Official',    'https://open.bigmodel.cn/api/paas/v4','openai_compat', 40, 'Zhipu official endpoint'),
  ('minimax-official','Minimax Official','https://api.minimaxi.com/v1',      'openai_compat', 45,  'Minimax official endpoint')
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  adapter = excluded.adapter,
  priority = excluded.priority,
  notes = excluded.notes;


-- ============================================================================
-- MODELS
-- Pricing source: same as ModelsView.jsx — input/output $/M tokens.
-- We add a 20% markup (admin-configurable later via UI).
-- micro_cents_per_M = price_usd * 1_000_000 * 1.20
-- ============================================================================

-- Helper: compute provider id by slug
do $$
declare
  p_anthropic_via_or  uuid := (select id from public.providers where slug = 'openrouter');
  p_openai_via_or     uuid := (select id from public.providers where slug = 'openrouter');
  p_glm               uuid := (select id from public.providers where slug = 'glm-official');
  p_minimax           uuid := (select id from public.providers where slug = 'minimax-official');
  p_deepseek_via_or   uuid := (select id from public.providers where slug = 'openrouter');
begin
  -- Anthropic models via OpenRouter ----------------------------------------
  insert into public.models
    (slug, display_name, provider_id, upstream_model_id, tier,
     input_price_per_m_micro_cents, output_price_per_m_micro_cents,
     context_tokens, max_output_tokens, description,
     supports_streaming, supports_tools, supports_vision)
  values
    ('claude-opus-4.7', 'Claude Opus 4.7', p_anthropic_via_or, 'anthropic/claude-opus-4.7', 'flagship',
      18000000, 90000000,  -- $15/M * 1.20 = $18/M ; $75/M * 1.20 = $90/M
      200000, 32000,
      'Anthropic top-tier. Deep reasoning, agentic workflows, long-form analysis.',
      true, true, true),
    ('claude-sonnet-4.6', 'Claude Sonnet 4.6', p_anthropic_via_or, 'anthropic/claude-sonnet-4.6', 'flagship',
      3600000, 18000000,   -- $3 -> $3.60 ; $15 -> $18
      200000, 16000,
      'Balanced flagship. Strong coding, writing, tool use.',
      true, true, true),
    ('claude-haiku-4.5', 'Claude Haiku 4.5', p_anthropic_via_or, 'anthropic/claude-haiku-4.5', 'fast',
      960000, 4800000,     -- $0.80 -> $0.96 ; $4 -> $4.80
      200000, 8000,
      'Fast and inexpensive. Chatbots, classification, structured extraction.',
      true, true, false)
  on conflict (slug) do update set
    upstream_model_id = excluded.upstream_model_id,
    tier = excluded.tier,
    input_price_per_m_micro_cents = excluded.input_price_per_m_micro_cents,
    output_price_per_m_micro_cents = excluded.output_price_per_m_micro_cents,
    context_tokens = excluded.context_tokens,
    max_output_tokens = excluded.max_output_tokens,
    description = excluded.description;

  -- Minimax (official) -----------------------------------------------------
  insert into public.models
    (slug, display_name, provider_id, upstream_model_id, tier,
     input_price_per_m_micro_cents, output_price_per_m_micro_cents,
     context_tokens, max_output_tokens, description,
     supports_streaming, supports_tools, supports_vision)
  values
    ('minimax-2.7', 'Minimax 2.7', p_minimax, 'abab2.7-chat', 'flagship',
      1440000, 5760000,    -- $1.20 -> $1.44 ; $4.80 -> $5.76
      256000, 16000,
      'Minimax flagship. Strong multilingual + multimodal.',
      true, false, true),
    ('minimax-2.5', 'Minimax 2.5', p_minimax, 'abab2.5-chat', 'standard',
      720000, 2880000,
      256000, 8000,
      'Reliable, cost-effective Minimax for general chat.',
      true, false, false)
  on conflict (slug) do update set
    upstream_model_id = excluded.upstream_model_id,
    input_price_per_m_micro_cents = excluded.input_price_per_m_micro_cents,
    output_price_per_m_micro_cents = excluded.output_price_per_m_micro_cents;

  -- Deepseek via OpenRouter -----------------------------------------------
  insert into public.models
    (slug, display_name, provider_id, upstream_model_id, tier,
     input_price_per_m_micro_cents, output_price_per_m_micro_cents,
     context_tokens, max_output_tokens, description,
     supports_streaming, supports_tools, supports_vision)
  values
    ('deepseek-v4-pro', 'Deepseek V4 Pro', p_deepseek_via_or, 'deepseek/deepseek-v4-pro', 'flagship',
      660000, 2628000,     -- $0.55 -> $0.66 ; $2.19 -> $2.628
      128000, 16000,
      'Top Deepseek. Reasoning, math, repo-scale code generation.',
      true, true, false),
    ('deepseek-v4-flash', 'Deepseek V4 Flash', p_deepseek_via_or, 'deepseek/deepseek-v4-flash', 'fast',
      168000, 336000,      -- $0.14 -> $0.168 ; $0.28 -> $0.336
      128000, 8000,
      'Lightweight Deepseek. Fast, cheap, capable for high-volume tasks.',
      true, false, false)
  on conflict (slug) do update set
    upstream_model_id = excluded.upstream_model_id,
    input_price_per_m_micro_cents = excluded.input_price_per_m_micro_cents,
    output_price_per_m_micro_cents = excluded.output_price_per_m_micro_cents;

  -- GLM (official) --------------------------------------------------------
  insert into public.models
    (slug, display_name, provider_id, upstream_model_id, tier,
     input_price_per_m_micro_cents, output_price_per_m_micro_cents,
     context_tokens, max_output_tokens, description,
     supports_streaming, supports_tools, supports_vision)
  values
    ('glm-5.1', 'GLM 5.1', p_glm, 'glm-5.1', 'flagship',
      600000, 2400000,     -- $0.50 -> $0.60 ; $2.00 -> $2.40
      128000, 8000,
      'Zhipu flagship. Strong Chinese + English performance.',
      true, true, false),
    ('glm-5', 'GLM 5', p_glm, 'glm-5', 'standard',
      360000, 1440000,
      128000, 8000,
      'Solid general-purpose GLM. Reliable for chat + tool calling.',
      true, true, false)
  on conflict (slug) do update set
    upstream_model_id = excluded.upstream_model_id,
    input_price_per_m_micro_cents = excluded.input_price_per_m_micro_cents,
    output_price_per_m_micro_cents = excluded.output_price_per_m_micro_cents;

  -- OpenAI via OpenRouter -------------------------------------------------
  insert into public.models
    (slug, display_name, provider_id, upstream_model_id, tier,
     input_price_per_m_micro_cents, output_price_per_m_micro_cents,
     context_tokens, max_output_tokens, description,
     supports_streaming, supports_tools, supports_vision)
  values
    ('gpt-5.3-codex', 'GPT 5.3 Codex', p_openai_via_or, 'openai/gpt-5.3-codex', 'flagship',
      6000000, 24000000,   -- $5 -> $6 ; $20 -> $24
      256000, 16000,
      'OpenAI specialized coding model. Refactoring, debugging, agentic dev.',
      true, true, false),
    ('gpt-5.5', 'GPT 5.5', p_openai_via_or, 'openai/gpt-5.5', 'flagship',
      9600000, 38400000,   -- $8 -> $9.60 ; $32 -> $38.40
      400000, 32000,
      'OpenAI most advanced. Multimodal, strong reasoning, broad knowledge.',
      true, true, true),
    ('gpt-5.4', 'GPT 5.4', p_openai_via_or, 'openai/gpt-5.4', 'flagship',
      5400000, 21600000,
      256000, 16000,
      'Previous OpenAI flagship. Excellent reasoning, slightly cheaper.',
      true, true, true)
  on conflict (slug) do update set
    upstream_model_id = excluded.upstream_model_id,
    input_price_per_m_micro_cents = excluded.input_price_per_m_micro_cents,
    output_price_per_m_micro_cents = excluded.output_price_per_m_micro_cents;
end $$;

# Storybook to SKILL.md Action

A GitHub Action that generates [SKILL.md](https://agentskills.io) files from your Storybook components for AI agents.

## Features

- Generate SKILL.md files automatically in CI/CD pipelines
- Support for OpenAI, Anthropic, and Google AI providers
- Use deployed Storybook URL or local build (offline mode)
- Incremental generation (skip unchanged components)
- Configurable include/exclude patterns
- Detailed output with generation statistics

## Usage

### Basic Example (with Storybook URL)

```yaml
name: Generate Skills

on:
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate SKILL.md files
        uses: sergiocarracedo/storybook-to-skill-md-action@v1
        with:
          storybook-url: 'https://your-storybook.com'
          source-dir: './src/components'
          output-dir: './skills'
          provider: 'openai'
          model: 'gpt-4o'
          api-key: ${{ secrets.OPENAI_API_KEY }}

      - name: Commit generated files
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add skills/
          git commit -m "chore: update SKILL.md files" || echo "No changes"
          git push
```

### Offline Mode (with Local Storybook Build)

```yaml
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Generate SKILL.md files
        uses: sergiocarracedo/storybook-to-skill-md-action@v1
        with:
          index-file: './storybook-static/index.json'
          source-dir: './src/components'
          output-dir: './skills'
          provider: 'anthropic'
          model: 'claude-3-5-sonnet-20241022'
          api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### With Filtering

```yaml
- name: Generate SKILL.md files
  uses: sergiocarracedo/storybook-to-skill-md-action@v1
  with:
    storybook-url: 'https://your-storybook.com'
    source-dir: './src'
    output-dir: './skills'
    provider: 'openai'
    model: 'gpt-4o'
    api-key: ${{ secrets.OPENAI_API_KEY }}
    include: |
      Components/**
      UI/**
    exclude: |
      **/Internal/**
      **/Deprecated/**
```

### With Performance Tuning

```yaml
- name: Generate SKILL.md files
  uses: sergiocarracedo/storybook-to-skill-md-action@v1
  with:
    storybook-url: 'https://your-storybook.com'
    source-dir: './src/components'
    output-dir: './skills'
    provider: 'openai'
    model: 'gpt-4o'
    api-key: ${{ secrets.OPENAI_API_KEY }}
    concurrency: '5'
    timeout: '120000'
    verbose: 'true'
```

## Inputs

| Input           | Description                              | Required | Default    |
| --------------- | ---------------------------------------- | -------- | ---------- |
| `storybook-url` | Storybook URL                            | No\*     | -          |
| `index-file`    | Path to local index.json                 | No\*     | -          |
| `source-dir`    | Source directory                         | Yes      | `./src`    |
| `output-dir`    | Output directory                         | Yes      | `./skills` |
| `provider`      | LLM provider (openai, anthropic, google) | Yes      | -          |
| `model`         | LLM model name                           | Yes      | -          |
| `api-key`       | API key for LLM provider                 | Yes      | -          |
| `include`       | Glob patterns to include (multiline)     | No       | -          |
| `exclude`       | Glob patterns to exclude (multiline)     | No       | -          |
| `concurrency`   | Concurrent LLM requests                  | No       | `3`        |
| `timeout`       | LLM timeout in ms                        | No       | `60000`    |
| `force`         | Force regeneration                       | No       | `false`    |
| `verbose`       | Verbose logging                          | No       | `false`    |

\*Either `storybook-url` or `index-file` must be provided.

## Outputs

| Output            | Description                              |
| ----------------- | ---------------------------------------- |
| `generated-count` | Number of SKILL.md files generated       |
| `skipped-count`   | Number of components skipped (unchanged) |
| `failed-count`    | Number of failures                       |

## LLM Provider Setup

### OpenAI

```yaml
with:
  provider: 'openai'
  model: 'gpt-4o'
  api-key: ${{ secrets.OPENAI_API_KEY }}
```

Available models: `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`

### Anthropic

```yaml
with:
  provider: 'anthropic'
  model: 'claude-3-5-sonnet-20241022'
  api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Available models: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307`

### Google

```yaml
with:
  provider: 'google'
  model: 'gemini-2.0-flash-exp'
  api-key: ${{ secrets.GOOGLE_API_KEY }}
```

Available models: `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash`

## Security Best Practices

1. **Store API keys as secrets** - Never hardcode API keys in your workflow file
2. **Use least privilege** - Grant only necessary permissions to your workflow
3. **Limit concurrency** - High concurrency may cause rate limiting

```yaml
permissions:
  contents: write # Only needed for committing generated files
```

## Troubleshooting

### Action fails with "Failed to install"

Make sure Node.js is available in your workflow:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

### Rate limiting errors

Reduce concurrency or increase timeout:

```yaml
with:
  concurrency: '1'
  timeout: '120000'
```

### Component extraction fails

Ensure source directory contains valid Storybook files. Check verbose output:

```yaml
with:
  verbose: 'true'
```

## License

MIT

## Related

- [Project Website](https://sergiocarracedo.github.io/storybook-to-skill-md/)
- [CLI tool docs](https://sergiocarracedo.github.io/storybook-to-skill-md/getting-started/github-action/)
- [storybook-to-skill-md](https://github.com/sergiocarracedo/storybook-to-skill-md) - The CLI tool
- [SKILL.md Specification](https://agentskills.io) - Format specification

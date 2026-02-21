import * as core from '@actions/core'
import { exec } from '@actions/exec'

async function run(): Promise<void> {
  try {
    const storybookUrl = core.getInput('storybook-url')
    const indexFile = core.getInput('index-file')
    const sourceDir = core.getInput('source-dir', { required: true })
    const outputDir = core.getInput('output-dir', { required: true })
    const provider = core.getInput('provider', { required: true })
    const model = core.getInput('model', { required: true })
    const apiKey = core.getInput('api-key', { required: true })
    const include = core.getMultilineInput('include')
    const exclude = core.getMultilineInput('exclude')
    const concurrency = core.getInput('concurrency')
    const timeout = core.getInput('timeout')
    const force = core.getInput('force')
    const verbose = core.getInput('verbose')

    if (!storybookUrl && !indexFile) {
      throw new Error(
        'Either "storybook-url" or "index-file" must be provided. Use "storybook-url" for deployed Storybook or "index-file" for offline mode.'
      )
    }

    core.info('Installing storybook-to-skill-md...')
    const installExitCode = await exec('npm', ['install', '-g', 'storybook-to-skill-md'], {
      silent: true,
    })

    if (installExitCode !== 0) {
      throw new Error('Failed to install storybook-to-skill-md')
    }

    const args: string[] = ['generate']

    if (storybookUrl) {
      args.push('--storybook-url', storybookUrl)
    }

    if (indexFile) {
      args.push('--index-file', indexFile)
    }

    args.push('--source-dir', sourceDir)
    args.push('--output-dir', outputDir)
    args.push('--provider', provider)
    args.push('--model', model)
    args.push('--api-key', apiKey)

    if (include.length > 0) {
      for (const pattern of include) {
        args.push('--include', pattern)
      }
    }

    if (exclude.length > 0) {
      for (const pattern of exclude) {
        args.push('--exclude', pattern)
      }
    }

    if (concurrency) {
      args.push('--concurrency', concurrency)
    }

    if (timeout) {
      args.push('--timeout', timeout)
    }

    if (force === 'true') {
      args.push('--force')
    }

    if (verbose === 'true') {
      args.push('--verbose')
    }

    core.info(`Running: storybook-to-skill-md ${args.join(' ')}`)

    let output = ''
    let errorOutput = ''

    const exitCode = await exec('storybook-to-skill-md', args, {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString()
        },
        stderr: (data: Buffer) => {
          errorOutput += data.toString()
        },
      },
    })

    if (exitCode !== 0) {
      core.error(`Error output:\n${errorOutput}`)
      core.setFailed(`storybook-to-skill-md failed with exit code ${exitCode}`)
      return
    }

    core.info('Output:\n' + output)

    const generatedMatch = output.match(/Generated:\s*(\d+)/)
    const skippedMatch = output.match(/Skipped:\s*(\d+)/)
    const failedMatch = output.match(/Failed:\s*(\d+)/)

    const generatedCount = generatedMatch?.[1] ?? '0'
    const skippedCount = skippedMatch?.[1] ?? '0'
    const failedCount = failedMatch?.[1] ?? '0'

    core.setOutput('generated-count', generatedCount)
    core.setOutput('skipped-count', skippedCount)
    core.setOutput('failed-count', failedCount)

    core.info(
      `SKILL.md generation complete! Generated: ${generatedCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`
    )

    if (failedCount !== '0') {
      core.setFailed(`${failedCount} component(s) failed to generate`)
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

run()

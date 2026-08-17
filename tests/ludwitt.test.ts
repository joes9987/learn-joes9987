import { describe, expect, it } from 'vitest'
import {
  parseEventBody,
  signLaunchToken,
  verifyLaunchToken
} from '../src/lib/ludwitt'

describe('launch JWT', () => {
  const secret = 'test-secret'
  const appId = 'app-123'

  it('signs and verifies a valid token', () => {
    const token = signLaunchToken(
      { sub: 'user-1', email: 'a@example.com', app_id: appId },
      secret
    )
    const result = verifyLaunchToken(token, secret, appId)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.claims.sub).toBe('user-1')
      expect(result.claims.email).toBe('a@example.com')
      expect(result.claims.app_id).toBe(appId)
    }
  })

  it('rejects wrong secret', () => {
    const token = signLaunchToken(
      { sub: 'user-1', email: 'a@example.com', app_id: appId },
      secret
    )
    const result = verifyLaunchToken(token, 'other', appId)
    expect(result.ok).toBe(false)
  })

  it('rejects app_id mismatch', () => {
    const token = signLaunchToken(
      { sub: 'user-1', email: 'a@example.com', app_id: appId },
      secret
    )
    const result = verifyLaunchToken(token, secret, 'other-app')
    expect(result.ok).toBe(false)
  })
})

describe('parseEventBody', () => {
  it('accepts lesson_started', () => {
    const parsed = parseEventBody({
      event: 'lesson_started',
      user_id: 'u1',
      session_id: 's1'
    })
    expect(parsed.ok).toBe(true)
  })

  it('accepts exercise and project events', () => {
    expect(
      parseEventBody({ event: 'exercise_completed', user_id: 'u1', session_id: 's1' }).ok
    ).toBe(true)
    expect(
      parseEventBody({ event: 'project_step_completed', user_id: 'u1', session_id: 's1' }).ok
    ).toBe(true)
    expect(
      parseEventBody({ event: 'project_completed', user_id: 'u1', session_id: 's1' }).ok
    ).toBe(true)
  })

  it('rejects heartbeat-only invalid type', () => {
    const parsed = parseEventBody({
      event: 'not_an_event',
      user_id: 'u1',
      session_id: 's1'
    })
    expect(parsed.ok).toBe(false)
  })
})

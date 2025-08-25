/** 개발모드에서 콘솔 출력 */
export const devLog = (level: 'log' | 'info' | 'warn' | 'error', msg: unknown, ...params: unknown[]): void => {
  if (process.env.DEV) {
    if (typeof msg !== 'string') {
      console[level](msg, ...params)
      return
    }

    switch (level) {
      case 'log':
        console.log(`%c✅ ${msg}`, 'color: #70c995;', ...params)
        break
      case 'info':
        console.info(`%cℹ️ ${msg}`, 'color: #74adf8;', ...params)
        break
      case 'warn':
        console.warn(`%c⚡️ ${msg}`, 'color: #fca12f;', ...params)
        break
      default:
        console[level](`%c🔥 ${msg}`, 'color: #e64f47;', ...params)
    }
  }
}

// 간편한 로그 함수들 추가로 내보내기
export const log = (msg: unknown, ...params: unknown[]): void => devLog('log', msg, ...params)
export const info = (msg: unknown, ...params: unknown[]): void => devLog('info', msg, ...params)
export const warn = (msg: unknown, ...params: unknown[]): void => devLog('warn', msg, ...params)
export const error = (msg: unknown, ...params: unknown[]): void => devLog('error', msg, ...params)


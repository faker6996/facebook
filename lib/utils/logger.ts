/**
 * Simple logger utility for development and production
 * Allows toggling log levels and centralized log management
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): [string, any?] {
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `${timestamp} ${prefix}${message}`;
    
    return data !== undefined ? [formattedMessage, data] : [formattedMessage];
  }

  debug(message: string, data?: any) {
    // Debug logging removed
  }

  info(message: string, data?: any) {
    // Info logging removed
  }

  warn(message: string, data?: any) {
    // Warning logging removed
  }

  error(message: string, data?: any) {
    if (this.shouldLog('error')) {
      const [msg, ...args] = this.formatMessage('error', message, data);
      console.error(`❌ ${msg}`, ...args);
    }
  }
}

// Create logger instances for different modules
export const signalRLogger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  enabled: true,
  prefix: 'SignalR'
});

export const messengerLogger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn', 
  enabled: true,
  prefix: 'Messenger'
});

export const createLogger = (prefix: string, level: LogLevel = 'info') => {
  return new Logger({
    level: process.env.NODE_ENV === 'development' ? level : 'warn',
    enabled: true,
    prefix
  });
};
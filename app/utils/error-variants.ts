import { tv } from 'tailwind-variants'

export const errorVariants = tv({
  slots: {
    container: 'rounded-2xl shadow-2xl border border-opacity-30',
    title: 'mb-4 text-6xl font-extrabold tracking-tight drop-shadow-[3px_3px_0px_#2c1810]',
    statusBadge: 'inline-block rounded px-3 py-1 font-mono text-xl font-bold border border-opacity-40',
    description: 'mb-6 text-2xl leading-relaxed font-medium',
    consoleBox: 'relative mx-auto mb-8 w-full max-w-[340px] overflow-hidden rounded-xl border-2 border-dashed border-opacity-100 p-6 animate-pulsebox',
    consoleText: 'pl-6 text-left font-mono text-sm leading-relaxed',
    consoleCursor: 'absolute left-4 animate-blink font-mono font-bold',
    buttonsContainer: 'flex flex-col justify-center gap-4 border-t border-opacity-20 px-6 py-8 sm:flex-row sm:gap-6',
    homeButton: 'btn flex w-full max-w-[250px] flex-1 items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:w-auto',
    supportButton: 'btn flex w-full max-w-[250px] flex-1 items-center justify-center gap-2 shadow-lg transition-all duration-200 btn-outline hover:scale-105 hover:shadow-xl sm:w-auto'
  },
  variants: {
    error: {
      400: {
        // Bad Request - Orange
        container: 'border-orange-500/30',
        title: 'text-orange-500',
        statusBadge: 'bg-orange-500/10 text-orange-500 border-orange-500/40',
        description: 'text-orange-200',
        consoleBox: 'border-orange-500 bg-orange-500/10',
        consoleText: 'text-orange-500',
        consoleCursor: 'text-orange-500',
        buttonsContainer: 'border-orange-500/20',
        homeButton: 'btn-warning',
        supportButton: 'hover:bg-orange-500/10'
      },
      401: {
        // Unauthorized - Yellow
        container: 'border-yellow-500/30',
        title: 'text-yellow-500',
        statusBadge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40',
        description: 'text-yellow-200',
        consoleBox: 'border-yellow-500 bg-yellow-500/10',
        consoleText: 'text-yellow-500',
        consoleCursor: 'text-yellow-500',
        buttonsContainer: 'border-yellow-500/20',
        homeButton: 'btn-warning',
        supportButton: 'hover:bg-yellow-500/10'
      },
      403: {
        // Forbidden - Purple
        container: 'border-purple-500/30',
        title: 'text-purple-500',
        statusBadge: 'bg-purple-500/10 text-purple-500 border-purple-500/40',
        description: 'text-purple-200',
        consoleBox: 'border-purple-500 bg-purple-500/10',
        consoleText: 'text-purple-500',
        consoleCursor: 'text-purple-500',
        buttonsContainer: 'border-purple-500/20',
        homeButton: 'btn-secondary',
        supportButton: 'hover:bg-purple-500/10'
      },
      404: {
        // Not Found - 
        container: 'border-[#ff5d5b]-500/30',
        title: 'text-[#ff5d5b]-500',
        statusBadge: 'bg-[#ff5d5b]-500/10 text-[#ff5d5b]-500 border-[#ff5d5b]-500/40',
        description: 'text-[#ff5d5b]-200',
        consoleBox: 'border-[#ff5d5b]-500 bg-[#ff5d5b]-500/10',
        consoleText: 'text-[#ff5d5b]-500',
        consoleCursor: 'text-[#ff5d5b]-500',
        buttonsContainer: 'border-[#ff5d5b]-500/20',
        homeButton: 'btn-info',
        supportButton: 'hover:bg-[#ff5d5b]-500/10'
      },
      405: {
        // Method Not Allowed - Indigo
        container: 'border-indigo-500/30',
        title: 'text-indigo-500',
        statusBadge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/40',
        description: 'text-indigo-200',
        consoleBox: 'border-indigo-500 bg-indigo-500/10',
        consoleText: 'text-indigo-500',
        consoleCursor: 'text-indigo-500',
        buttonsContainer: 'border-indigo-500/20',
        homeButton: 'btn-info',
        supportButton: 'hover:bg-indigo-500/10'
      },
      408: {
        // Request Timeout - Teal
        container: 'border-teal-500/30',
        title: 'text-teal-500',
        statusBadge: 'bg-teal-500/10 text-teal-500 border-teal-500/40',
        description: 'text-teal-200',
        consoleBox: 'border-teal-500 bg-teal-500/10',
        consoleText: 'text-teal-500',
        consoleCursor: 'text-teal-500',
        buttonsContainer: 'border-teal-500/20',
        homeButton: 'btn-accent',
        supportButton: 'hover:bg-teal-500/10'
      },
      500: {
        // Internal Server Error - Red (default)
        container: 'border-red-500/30',
        title: 'text-red-500',
        statusBadge: 'bg-red-500/10 text-red-500 border-red-500/40',
        description: 'text-red-200',
        consoleBox: 'border-red-500 bg-red-500/10',
        consoleText: 'text-red-500',
        consoleCursor: 'text-red-500',
        buttonsContainer: 'border-red-500/20',
        homeButton: 'btn-error',
        supportButton: 'hover:bg-red-500/10'
      },
      501: {
        // Not Implemented - Cyan (celeste come richiesto)
        container: 'border-cyan-400/30',
        title: 'text-cyan-400',
        statusBadge: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/40',
        description: 'text-cyan-200',
        consoleBox: 'border-cyan-400 bg-cyan-400/10',
        consoleText: 'text-cyan-400',
        consoleCursor: 'text-cyan-400',
        buttonsContainer: 'border-cyan-400/20',
        homeButton: 'btn-info',
        supportButton: 'hover:bg-cyan-400/10'
      },
      502: {
        // Bad Gateway - Emerald
        container: 'border-emerald-500/30',
        title: 'text-emerald-500',
        statusBadge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40',
        description: 'text-emerald-200',
        consoleBox: 'border-emerald-500 bg-emerald-500/10',
        consoleText: 'text-emerald-500',
        consoleCursor: 'text-emerald-500',
        buttonsContainer: 'border-emerald-500/20',
        homeButton: 'btn-success',
        supportButton: 'hover:bg-emerald-500/10'
      },
      503: {
        // Service Unavailable - Amber
        container: 'border-amber-500/30',
        title: 'text-amber-500',
        statusBadge: 'bg-amber-500/10 text-amber-500 border-amber-500/40',
        description: 'text-amber-200',
        consoleBox: 'border-amber-500 bg-amber-500/10',
        consoleText: 'text-amber-500',
        consoleCursor: 'text-amber-500',
        buttonsContainer: 'border-amber-500/20',
        homeButton: 'btn-warning',
        supportButton: 'hover:bg-amber-500/10'
      },
      504: {
        // Gateway Timeout - Rose
        container: 'border-rose-500/30',
        title: 'text-rose-500',
        statusBadge: 'bg-rose-500/10 text-rose-500 border-rose-500/40',
        description: 'text-rose-200',
        consoleBox: 'border-rose-500 bg-rose-500/10',
        consoleText: 'text-rose-500',
        consoleCursor: 'text-rose-500',
        buttonsContainer: 'border-rose-500/20',
        homeButton: 'btn-error',
        supportButton: 'hover:bg-rose-500/10'
      },
      505: {
        // HTTP Version Not Supported - Violet
        container: 'border-violet-500/30',
        title: 'text-violet-500',
        statusBadge: 'bg-violet-500/10 text-violet-500 border-violet-500/40',
        description: 'text-violet-200',
        consoleBox: 'border-violet-500 bg-violet-500/10',
        consoleText: 'text-violet-500',
        consoleCursor: 'text-violet-500',
        buttonsContainer: 'border-violet-500/20',
        homeButton: 'btn-secondary',
        supportButton: 'hover:bg-violet-500/10'
      }
    }
  },
  defaultVariants: {
    error: 500
  }
})

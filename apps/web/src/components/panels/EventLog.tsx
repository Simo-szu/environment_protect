"use client"

import { useUIState } from '@/store/simulationStore'

export default function EventLog() {
  // 使用throttled UI状态，确保30fps平滑渲染
  const { eventLog: events } = useUIState()
  return (
    <div className="w-full h-[140px] rounded-xl border bg-white p-2 overflow-y-auto text-sm">
      {events.length === 0 ? (
        <div className="text-neutral-500">暂无事件</div>
      ) : (
        <ul className="space-y-1">
          {events.slice(-50).map((e, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`${e.key}-${i}`} className={severityClass(e.severity)}>
              <span className="mr-2 text-xs text-neutral-400">[t{e.tick}]</span>
              {e.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function severityClass(s: 'event' | 'warn' | 'disaster') {
  if (s === 'warn') return 'text-amber-600'
  if (s === 'disaster') return 'text-red-600'
  return 'text-neutral-800'
}


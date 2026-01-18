export const formatDuration = (totalSeconds: number) => {
  const clamped = Math.max(0, totalSeconds)
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = Math.floor(clamped % 60)

  const parts = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0'))
  return parts.join(':')
}

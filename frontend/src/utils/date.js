export const toLocalISODate = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// O backend envia LocalDateTime em UTC sem fuso; marca como UTC para exibir no horário local
export const serverTimestampToISO = (value) => {
  if (typeof value !== "string" || !value) return value
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value.replace(" ", "T")}Z`
}

// "YYYY-MM-DD" vira Date em horário local (new Date(str) interpretaria como UTC e mostraria o dia anterior)
export const parseLocalDate = (value) => {
  if (value instanceof Date) return value
  const m = typeof value === "string" ? value.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
}

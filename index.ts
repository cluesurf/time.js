export type SpanType = {
  type: 'span'
  second: number
  minute: number
  hour: number
  day: number
  week: number
  month: number
  year: number
  decade: number
  century: number
  thousand: number
  million: number
  billion: number
  relative: boolean
}

export type RangeType = {
  type: 'range'
  start: SpanType
  end: SpanType
}

export default parse

export function parse(time: string) {
  if (
    time.match(
      /^(\d+)\s*[-‒–—―]\s*(\d+)\s+(million|billion|thousand|hundred) (year|week|month|day|hour|minute|second)s? ago$/i,
    )
  ) {
    return buildLargeRange(
      RegExp.$1,
      RegExp.$2,
      RegExp.$3,
      RegExp.$4,
      tp,
    )
  } else if (
    time.match(
      /^(\d+)\s*[-‒–—―]\s*(\d+)\s+(million|billion|thousand|hundred) (year|week|month|day|hour|minute|second)s?$/i,
    )
  ) {
    return buildLargeRange(
      RegExp.$1,
      RegExp.$2,
      RegExp.$3,
      RegExp.$4,
      ts,
    )
  } else if (time.match(/^(\d+)\s*[-‒–—―]\s*(\d+)\s+(kmb)ya?$/i)) {
    return buildLargeRange(
      RegExp.$1,
      RegExp.$2,
      RegExp.$3,
      RegExp.$4,
      tp,
    )
  } else if (time.match(/^(\d+)s$/i)) {
    return buildTimePeriod(RegExp.$1)
  } else if (
    time.match(
      /^(\d+)\w* (century|decade|year) (?:bce?|b\.c\.e\.|b\.c\.)$/i,
    )
  ) {
    return buildPeriodBCE(RegExp.$1, RegExp.$2)
  } else if (
    time.match(
      /^(\d+)(?:th|st|nd|rd)? (century|decade|year) (?:ce|ad|c\.e\.|a\.d\.)$/i,
    )
  ) {
    return buildPeriod(RegExp.$1, RegExp.$2)
  } else if (
    time.match(/^(\d+)(?:th|st|nd|rd)? (century|decade|year)$/i)
  ) {
    return buildPeriod(RegExp.$1, RegExp.$2)
  } else if (time.match(/^(\d+)\s*(?:bce?|b\.c\.e\.|b\.c\.)$/i)) {
    return buildBCE(RegExp.$1)
  } else if (time.match(/^(\d+)\s*(?:bp|b\.p\.)$/i)) {
    return buildBP(RegExp.$1)
  } else if (time.match(/^(\d+)\s*(?:ce|ad|c\.e\.|a\.d\.)$/i)) {
    return buildYear(RegExp.$1)
  } else if (time.match(/^(\d+)\s*([kmbGM])ya$/)) {
    return buildLargeYearsAgo(RegExp.$1, RegExp.$2)
  } else if (time.match(/^(\d+)$/)) {
    return buildYear(RegExp.$1)
  } else if (time.match(/^([\d,\.]+)\s*([kMGTPE])a$/)) {
    return buildLargeSpan(RegExp.$1, RegExp.$2)
  } else if (
    time.match(/^([\d,\.]+)\s+(year|day|week|month)s? ago$/i)
  ) {
    return buildHumanPoint(RegExp.$1, RegExp.$2)
  } else if (time.match(/^([\d,\.]+)\s+(year|day|week|month)s?$/i)) {
    return buildHumanSpan(RegExp.$1, RegExp.$2)
  }
}

function buildLargeRange(
  startNumeric: string,
  endNumeric: string,
  scale: string,
  period: string,
  builder: (v: any) => SpanType,
) {
  let start = parseNumber(startNumeric)
  let end = parseNumber(endNumeric)

  switch (scale) {
    case 'hundred':
      start *= 100
      end *= 100
      break
    case 'thousand':
      start *= 1000
      end *= 1000
      break
    case 'million':
      start *= 1000000
      end *= 1000000
      break
    case 'billion':
      start *= 1000000000
      end *= 1000000000
      break
  }

  return tr({
    start: builder({ [period]: start }),
    end: builder({ [period]: end }),
  })
}

function buildHumanSpan(numeric: string, period: string) {
  const num = parseNumber(numeric)
  return ts({ [period]: num })
}

function buildHumanPoint(numeric: string, period: string) {
  const num = parseNumber(numeric)
  return tp({ [period]: -num })
}

function parseNumber(numeric: string) {
  return Number(numeric.replace(/[,_]/g, ''))
}

// 1500s, 1610s
function buildTimePeriod(numeric: string) {
  const num = parseNumber(numeric)
  if (num % 100 === 0) {
    return tr({
      start: tp(distributeYear(num - 1970)),
      end: tp(distributeYear(num + 100 - 1970)),
    })
  } else if (num % 10 === 0) {
    return tr({
      start: tp(distributeYear(num - 1970)),
      end: tp(distributeYear(num + 10 - 1970)),
    })
  } else {
    return tp(distributeYear(num - 1970))
  }
}

// - ka (for kiloannus) One thousand years.
// - Ma (for megaannus) One million years.
// - Ga (for gigaannus) One billion years.
// - Ta (for teraannus) One trillion years.
// - Pa (for petaannus) One quadrillion years.
// - Ea (for exaannus)

function buildLargeSpan(numeric: string, scale: string) {
  const num = parseNumber(numeric)
  switch (scale) {
    case 'k':
      return ts({ thousand: num })
    case 'M':
      return ts({ million: num })
    case 'G':
      return ts({ billion: num })
    default:
      throw new Error(`Too large a time span`)
  }
}

function buildYear(numeric: string) {
  const num = parseNumber(numeric)
  return tp({ year: num - 1970 })
}

function buildLargeYearsAgo(numeric: string, scale: string) {
  const num = parseNumber(numeric)
  switch (scale) {
    case 'k':
      return tp({ thousand: -num })
    case 'm':
    case 'M':
      return tp({ million: -num })
    case 'b':
    case 'G':
      return tp({ billion: -num })
    default:
      throw new Error(`Unhandled type`)
  }
}

function buildPeriod(numeric: string, period: string) {
  const num = parseNumber(numeric)
  switch (period) {
    case 'century': {
      const centuryToYear = (num - 19) * 100
      const data = distributeYear(centuryToYear - 70)
      return tp(data)
    }
    case 'decade':
      return tp({ year: -70, century: -19, decade: num })
    default:
      throw new Error(`Unhandled type`)
  }
}

function buildPeriodBCE(numeric: string, period: string) {
  const num = parseNumber(numeric)
  switch (period) {
    case 'century': {
      const centuryToYear = (-19 - num) * 100
      const data = distributeYear(centuryToYear - 70)
      return tp(data)
    }
    case 'decade':
      return tp({ year: -70, century: -19, decade: -num })
    default:
      throw new Error(`Unhandled type`)
  }
}

function buildBCE(numeric: string) {
  const num = parseNumber(numeric)
  const data = distributeYear(-1970 - num)
  return tp(data)
}

// before 1950, so subtract 20 from 1970
function buildBP(numeric: string) {
  const num = parseNumber(numeric)
  const data = distributeYear(-20 - num)
  return tp(data)
}

function tr({ start, end }): RangeType {
  return {
    type: 'range',
    start,
    end,
  }
}

function tp({
  second = 0,
  minute = 0,
  hour = 0,
  day = 0,
  week = 0,
  month = 0,
  year = 0,
  decade = 0,
  century = 0,
  thousand = 0,
  million = 0,
  billion = 0,
} = {}): SpanType {
  return ts({
    relative: true,
    second,
    minute,
    hour,
    day,
    week,
    month,
    year,
    decade,
    century,
    thousand,
    million,
    billion,
  })
}

function ts({
  relative = false,
  second = 0,
  minute = 0,
  hour = 0,
  day = 0,
  week = 0,
  month = 0,
  year = 0,
  decade = 0,
  century = 0,
  thousand = 0,
  million = 0,
  billion = 0,
} = {}): SpanType {
  return {
    type: 'span',
    second,
    minute,
    hour,
    day,
    week,
    month,
    year,
    decade,
    century,
    thousand,
    million,
    billion,
    relative,
  }
}

function distributeYear(integer: number) {
  let n = integer

  const thousand = Math.ceil(n / 1000)

  n = n - thousand * 1000

  const century = Math.ceil(n / 100)

  n = n - century * 100

  const decade = Math.ceil(n / 10)

  n = n - decade * 10

  const year = Math.ceil(n)

  const data: Record<string, number> = {}

  if (thousand) {
    data.thousand = thousand
  }

  if (century) {
    data.century = century
  }

  if (decade) {
    data.decade = decade
  }

  if (year) {
    data.year = year
  }

  return data
}

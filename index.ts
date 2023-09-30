export default {
  point,
  range,
}

export function range(range: string) {}

export function point(time: string, fuzz?: string | number) {
  if (time.match(/(\d+)\w* century (?:bce?|b\.c\.e\.|b\.c\.)/i)) {
    return buildCenturyBCE(RegExp.$1)
  } else if (time.match(/(\d+)\w* century (?:ce|ad|c\.e\.|a\.d\.)/i)) {
    return buildCentury(RegExp.$1)
  } else if (time.match(/(\d+)\w* century/i)) {
    return buildCentury(RegExp.$1)
  } else if (time.match(/(\d+)\w* (?:bce?|b\.c\.e\.|b\.c\.)/i)) {
    return buildBCE(RegExp.$1)
  } else if (time.match(/(\d+)\w* bp/i)) {
    return buildBP(RegExp.$1)
  } else if (time.match(/(\d+)\w* (?:ce|ad|c\.e\.|a\.d\.)/i)) {
    return buildYear(RegExp.$1)
  } else if (time.match(/(\d+)([kmbGM])ya/)) {
    return buildLargeYearsAgo(RegExp.$1, RegExp.$2)
  } else if (time.match(/^(\d+)$/)) {
    return buildYear(RegExp.$1)
  } else if (time.match(/([kMGTPE])a/)) {
  }
}

// - ka (for kiloannus) One thousand years.
// - Ma (for megaannus) One million years.
// - Ga (for gigaannus) One billion years.
// - Ta (for teraannus) One trillion years.
// - Pa (for petaannus) One quadrillion years.
// - Ea (for exaannus)

function buildLargeYears() {}

function buildYear(numeric: string) {
  const num = parseInt(numeric, 10)
  return ts({ year: num - 1970 })
}

function buildLargeYearsAgo(numeric: string, scale: string) {
  const num = parseInt(numeric, 10)
  switch (scale) {
    case 'k':
      return ts({ thousand: -num })
    case 'm':
    case 'M':
      return ts({ million: -num })
    case 'b':
    case 'G':
      return ts({ billion: -num })
  }
}

function buildCentury(numeric: string) {
  const num = parseInt(numeric, 10)
  return ts({ year: -70, century: num })
}

function buildCenturyBCE(numeric: string) {
  const num = parseInt(numeric, 10)
  return ts({ year: -70, century: -19 - num })
}

function buildBCE(numeric: string) {
  const num = parseInt(numeric, 10)
  return ts({ year: -num, century: -19 })
}

// before 1950, so subtract 20 from 1970
function buildBP(numeric: string) {
  const num = parseInt(numeric, 10)
  return ts({ year: -20 - num })
}

function ts({
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
} = {}) {
  return {
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
  }
}

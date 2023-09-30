import parse, { SpanType } from '.'

show('15th century bce')
show('15th century')
show('1500')
show('5mya')
show('4bya')
show('145kya')
show('1500')
show('1540s')
show('1100s')
show('370,000 years')
show('1,200 days ago')
show('13-17 million years')

function show(time) {
  const data = parse(time)

  if (data) {
    if (data.type === 'span' && data.relative) {
      const map = buildPointMap(data)
      console.log(`Time point`, map)
    } else if (data.type === 'span') {
      const map = buildPointMap(data)
      console.log(`Time span`, map)
    } else if (data.type === 'range') {
      const start = buildPointMap(data.start)
      const end = buildPointMap(data.end)
      console.log(`Time range`, start, 'to', end)
    }
  } else {
    throw new Error(`Didn't parse '${time}'`)
  }
}

function buildPointMap(data: SpanType) {
  const map: Record<string, number> = {}
  for (const name in data) {
    if (data[name] && typeof data[name] === 'number') {
      map[name] = data[name]
    }
  }
  return map
}

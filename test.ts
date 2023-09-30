import { point } from '.'

show('15th century bce')
show('15th century')
show('1500')
show('5mya')
show('4bya')
show('145kya')
show('1500')

function show(time) {
  const data = point(time)

  if (data) {
    const map: Record<string, number> = {}
    for (const name in data) {
      if (data[name]) {
        map[name] = data[name]
      }
    }
    console.log(map)
  } else {
    throw new Error(`Didn't parse '${time}'`)
  }
}

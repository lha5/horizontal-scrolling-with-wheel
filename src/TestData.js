import namor from 'namor';

const range = len => {
  const arr = [];

  for (let i = 0; i < len; i++) {
    arr.push(i)
  };

  return arr;
};

const newData = () => {
  const statusChance = Math.random();
  return {
    name: namor.generate({ words: 1, numbers: 0 }),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status:
    statusChance > 0.66
    ? 'O'
    : statusChance > 0.33
    ? 'X'
    : '-',
  };
};

export default function TestData(lens) {
  // const makeDataLevel = (depth = 0) => {
    // const len = lens[depth];
    // return range(len).map(d => {
    //   return {
    //     ...newData(),
    //     subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
    //   };
    // });
  // };
  const makeDataLevel = () => {
    return range(lens).map((data, index) => {
      return {
        index: index + 1,
        ...newData(),
      }
    });
  };

  return makeDataLevel();
};
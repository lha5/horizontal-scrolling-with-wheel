const data = Array.from(
    {
      length: 10,
    },
    (_, key) => ({
      key,
      title: key + ' - title',
      content: key + ' - content',
    }),
);

export default data;
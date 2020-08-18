const kFormatter = num => {
  if (Math.abs(num) < 999) return num;
  const value = Math.sign(num) * Number(Math.abs(num) / 1000);

  return `${value.toFixed(1)}k`;
};

export default kFormatter;

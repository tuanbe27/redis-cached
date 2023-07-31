const memorize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = fn.name + args.join("-");
    if (!cache.has(key)) {
      cache.set(key, fn(args));
    }

    return cache.get(key);
  };
};

const fibo = (n) => {
  if (n < 2) return 1;
  return fibo(n - 1) + fibo(n - 2);
};

const fiboWithMemo = memorize(fibo);

console.time("first");
console.log(fiboWithMemo(42));
console.timeEnd("first");
console.time("second");
console.log(fiboWithMemo(42));
console.timeEnd("second");
console.time("third");
console.log(fiboWithMemo(42));
console.timeEnd("third");

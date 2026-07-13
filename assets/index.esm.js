class e extends Error {
  constructor(t2) {
    super(null != t2 ? `Timed out after waiting for ${t2} ms` : "Timed out"), Object.setPrototypeOf(this, e.prototype);
  }
}
const t = (e2, t2) => new Promise((o2, n) => {
  try {
    e2.schedule(o2, t2);
  } catch (e3) {
    n(e3);
  }
}), o = { schedule: (e2, t2) => {
  let o2;
  const n = (e3) => {
    null != e3 && clearTimeout(e3), o2 = void 0;
  };
  return o2 = setTimeout(() => {
    n(o2), e2();
  }, t2), { cancel: () => n(o2) };
} }, c = Number.POSITIVE_INFINITY, l = (n, r, l2) => {
  var s, u;
  const i = null !== (s = "number" == typeof r ? r : null == r ? void 0 : r.timeout) && void 0 !== s ? s : 5e3, a = null !== (u = "number" == typeof r ? l2 : null == r ? void 0 : r.intervalBetweenAttempts) && void 0 !== u ? u : 50;
  let m = false;
  const d = () => new Promise((e2, r2) => {
    const c2 = () => {
      m || new Promise((e3, t2) => {
        try {
          e3(n());
        } catch (e4) {
          t2(e4);
        }
      }).then((n2) => {
        n2 ? e2(n2) : t(o, a).then(c2).catch(r2);
      }).catch(r2);
    };
    c2();
  }), h = i !== c ? () => t(o, i).then(() => {
    throw m = true, new e(i);
  }) : void 0;
  return null != h ? Promise.race([d(), h()]) : d();
};
export {
  l
};

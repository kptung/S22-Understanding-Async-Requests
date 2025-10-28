function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing .env var: ${name}`);
  return v;
}

export default required;

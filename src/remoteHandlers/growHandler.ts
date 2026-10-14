export async function main(ns: NS) {
  const target = ns.args[0] as string;

  if (!target) {
    ns.tprint("Argument [0] \"target\" required");
    return;
  }

  await ns.grow(target);
}
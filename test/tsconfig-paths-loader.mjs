const sourceRoot = new URL("../src/", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }

  if (specifier.startsWith("@/")) {
    const sourceUrl = new URL(`${specifier.slice(2)}.ts`, sourceRoot);
    return nextResolve(sourceUrl.href, context);
  }

  return nextResolve(specifier, context);
}

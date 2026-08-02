export function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function externalLinkProps(href: string) {
  return isExternalHref(href)
    ? { rel: "noreferrer", target: "_blank" }
    : {};
}
